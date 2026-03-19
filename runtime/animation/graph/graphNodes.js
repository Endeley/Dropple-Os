import { lerp, safeNumber } from '../blending/blendUtils.js';

function toLayer(id, channels, { mode = 'replace', weight = 1 } = {}) {
    return {
        id,
        mode,
        weight: safeNumber(weight),
        channels: Array.isArray(channels) ? channels : [],
    };
}

function mergeLayers(aLayers, bLayers, op) {
    const map = new Map();

    function apply(layer) {
        for (const channel of layer?.channels ?? []) {
            const key = `${channel.controllerId}:${channel.channel}`;
            const existing = map.get(key);

            if (!existing) {
                map.set(key, { ...channel });
                continue;
            }

            existing.value = op(
                safeNumber(existing.value),
                safeNumber(channel.value)
            );
        }
    }

    for (const layer of aLayers ?? []) apply(layer);
    for (const layer of bLayers ?? []) apply(layer);

    return [
        toLayer('merged', Array.from(map.values())),
    ];
}

function getFirstChannelValue(layers) {
    for (const layer of layers ?? []) {
        for (const channel of layer?.channels ?? []) {
            if (channel?.value !== undefined) {
                return safeNumber(channel.value);
            }
        }
    }

    return null;
}

function getPointFromLayers(layers) {
    let x = null;
    let y = null;

    for (const layer of layers ?? []) {
        for (const channel of layer?.channels ?? []) {
            if (x == null && (channel?.channel === 'x' || channel?.channel === 'targetX')) {
                x = safeNumber(channel.value);
            }
            if (y == null && (channel?.channel === 'y' || channel?.channel === 'targetY')) {
                y = safeNumber(channel.value);
            }
        }
    }

    return x == null && y == null ? null : { x: x ?? 0, y: y ?? 0 };
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function distance(ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    return Math.sqrt(dx * dx + dy * dy);
}

function solveTwoBoneIK(root, joint, end, target) {
    const ax = safeNumber(root?.x);
    const ay = safeNumber(root?.y);
    const bx = safeNumber(joint?.x);
    const by = safeNumber(joint?.y);
    const cx = safeNumber(end?.x);
    const cy = safeNumber(end?.y);
    const tx = safeNumber(target?.x);
    const ty = safeNumber(target?.y);

    const ab = distance(ax, ay, bx, by);
    const bc = distance(bx, by, cx, cy);
    const at = distance(ax, ay, tx, ty);
    const clampedDist = clamp(at, 0.0001, ab + bc - 0.0001);
    const cosAngle = clamp(
        (ab * ab + bc * bc - clampedDist * clampedDist) / (2 * ab * bc),
        -1,
        1
    );
    const angleB = Math.acos(cosAngle);
    const angleA =
        Math.atan2(ty - ay, tx - ax) -
        Math.atan2(bc * Math.sin(angleB), ab + bc * Math.cos(angleB));

    return {
        rootAngle: angleA,
        jointAngle: angleB,
    };
}

function evaluateCurve(keys, x) {
    const ordered = Array.isArray(keys)
        ? keys
              .filter((key) => key && key.x !== undefined && key.y !== undefined)
              .slice()
              .sort((left, right) => safeNumber(left.x) - safeNumber(right.x))
        : [];

    if (!ordered.length) return 0;

    const first = ordered[0];
    if (x <= safeNumber(first.x)) {
        return safeNumber(first.y);
    }

    const last = ordered[ordered.length - 1];
    if (x >= safeNumber(last.x)) {
        return safeNumber(last.y);
    }

    for (let index = 0; index < ordered.length - 1; index += 1) {
        const left = ordered[index];
        const right = ordered[index + 1];
        const leftX = safeNumber(left.x);
        const rightX = safeNumber(right.x);

        if (x < leftX || x > rightX) continue;
        if (rightX === leftX) {
            return safeNumber(right.y);
        }

        const t = (x - leftX) / (rightX - leftX);
        return lerp(safeNumber(left.y), safeNumber(right.y), t);
    }

    return 0;
}

function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}

function easeLinear(t) {
    return t;
}

function easeIn(t) {
    return t * t;
}

function easeOut(t) {
    return 1 - Math.pow(1 - t, 2);
}

function easeInOut(t) {
    if (t < 0.5) {
        return 2 * t * t;
    }

    return 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function resolveEase(mode) {
    switch (mode) {
        case 'easeIn':
            return easeIn;
        case 'easeOut':
            return easeOut;
        case 'easeInOut':
            return easeInOut;
        case 'linear':
        default:
            return easeLinear;
    }
}

function springResponse(t, stiffness, damping) {
    const safeT = Math.max(0, t);
    const k = Math.max(0.0001, safeNumber(stiffness ?? 10));
    const d = Math.max(0.0001, safeNumber(damping ?? 5));
    const envelope = Math.exp(-d * safeT);
    const oscillation = Math.cos(k * safeT);

    return 1 - envelope * oscillation;
}

function deterministicNoise(seed, x) {
    const n = Math.sin(x * 12.9898 + seed * 78.233) * 43758.5453;
    return n - Math.floor(n);
}

function toSignedNoise(value) {
    return value * 2 - 1;
}

export const GRAPH_NODE_EVALUATORS = {
    value(node) {
        if (!node?.controllerId || !node?.channel) return [];

        return [
            toLayer(`node:${node.id}`, [
                {
                    controllerId: node.controllerId,
                    channel: node.channel,
                    value: safeNumber(node.value),
                },
            ]),
        ];
    },

    parameter(node, context) {
        if (!node?.controllerId || !node?.channel) return [];

        const value = safeNumber(
            context?.parameters?.[node.name] ?? node?.default ?? 0
        );

        return [
            toLayer(`param:${node.name}`, [
                {
                    controllerId: node.controllerId,
                    channel: node.channel,
                    value,
                },
            ]),
        ];
    },

    add(node, context, inputs) {
        return mergeLayers(inputs[0], inputs[1], (left, right) => left + right);
    },

    multiply(node, context, inputs) {
        return mergeLayers(inputs[0], inputs[1], (left, right) => left * right);
    },

    mix(node, context, inputs) {
        const weight = safeNumber(node?.weight ?? 0.5);

        return mergeLayers(
            inputs[0],
            inputs[1],
            (left, right) => lerp(left, right, weight)
        );
    },

    clamp(node, context, inputs) {
        const min = safeNumber(node?.min ?? 0);
        const max = safeNumber(node?.max ?? 1);

        return (inputs[0] ?? []).map((layer) =>
            toLayer(
                layer?.id,
                (layer?.channels ?? []).map((channel) => ({
                    ...channel,
                    value: Math.min(max, Math.max(min, safeNumber(channel.value))),
                })),
                {
                    mode: layer?.mode,
                    weight: layer?.weight,
                }
            )
        );
    },

    remap(node, context, inputs) {
        const inMin = safeNumber(node?.inMin ?? 0);
        const inMax = safeNumber(node?.inMax ?? 1);
        const outMin = safeNumber(node?.outMin ?? 0);
        const outMax = safeNumber(node?.outMax ?? 1);
        const range = inMax - inMin || 1;

        return (inputs[0] ?? []).map((layer) =>
            toLayer(
                layer?.id,
                (layer?.channels ?? []).map((channel) => {
                    const t = (safeNumber(channel.value) - inMin) / range;
                    return {
                        ...channel,
                        value: lerp(outMin, outMax, t),
                    };
                }),
                {
                    mode: layer?.mode,
                    weight: layer?.weight,
                }
            )
        );
    },

    time(node, context) {
        const value = safeNumber(context?.frame ?? 0);

        if (!node?.controllerId || !node?.channel) return [];

        return [
            toLayer(`time:${node.id}`, [
                {
                    controllerId: node.controllerId,
                    channel: node.channel,
                    value,
                },
            ]),
        ];
    },

    sin(node, context) {
        const time = safeNumber(context?.frame ?? 0);
        const amplitude = safeNumber(node?.amplitude ?? 1);
        const frequency = safeNumber(node?.frequency ?? 1);
        const phase = safeNumber(node?.phase ?? 0);
        const value = Math.sin(time * frequency + phase) * amplitude;

        if (!node?.controllerId || !node?.channel) return [];

        return [
            toLayer(`sin:${node.id}`, [
                {
                    controllerId: node.controllerId,
                    channel: node.channel,
                    value,
                },
            ]),
        ];
    },

    noise(node, context) {
        const frame = safeNumber(context?.frame ?? 0);
        const seed = safeNumber(node?.seed ?? 0);
        const frequency = safeNumber(node?.frequency ?? 1);
        const amplitude = safeNumber(node?.amplitude ?? 1);
        const offset = safeNumber(node?.offset ?? 0);

        if (!node?.controllerId || !node?.channel) return [];

        const t = frame * frequency + offset;
        const value = toSignedNoise(deterministicNoise(seed, t)) * amplitude;

        return [
            toLayer(`noise:${node.id}`, [
                {
                    controllerId: node.controllerId,
                    channel: node.channel,
                    value,
                },
            ]),
        ];
    },

    curve(node, context, inputs) {
        if (!node?.controllerId || !node?.channel) return [];

        const inputValue =
            getFirstChannelValue(inputs?.[0]) ??
            safeNumber(node?.value ?? node?.inputValue ?? 0);
        const value = evaluateCurve(node?.keys, inputValue);

        return [
            toLayer(`curve:${node.id}`, [
                {
                    controllerId: node.controllerId,
                    channel: node.channel,
                    value,
                },
            ]),
        ];
    },

    ease(node, context, inputs) {
        if (!node?.controllerId || !node?.channel) return [];

        const inputValue =
            getFirstChannelValue(inputs?.[0]) ??
            safeNumber(node?.value ?? node?.inputValue ?? 0);
        const t = clamp01(inputValue);
        const value = resolveEase(node?.mode)(t);

        return [
            toLayer(`ease:${node.id}`, [
                {
                    controllerId: node.controllerId,
                    channel: node.channel,
                    value,
                },
            ]),
        ];
    },

    spring(node, context, inputs) {
        if (!node?.controllerId || !node?.channel) return [];

        const inputValue =
            getFirstChannelValue(inputs?.[0]) ??
            safeNumber(node?.value ?? 0);
        const frame = safeNumber(context?.frame ?? 0);
        const timeScale = Math.max(0.0001, safeNumber(node?.timeScale ?? 60));
        const time = frame / timeScale;
        const response = springResponse(
            time,
            node?.stiffness ?? 10,
            node?.damping ?? 5
        );

        return [
            toLayer(`spring:${node.id}`, [
                {
                    controllerId: node.controllerId,
                    channel: node.channel,
                    value: inputValue * response,
                },
            ]),
        ];
    },

    ik(node, context, inputs) {
        if (!Array.isArray(node?.chain) || node.chain.length !== 3) return [];

        const [rootId, jointId, endId] = node.chain;
        const rigComputed = context?.rigComputed ?? context?.nodeTransforms ?? {};
        const root = rigComputed?.[rootId];
        const joint = rigComputed?.[jointId];
        const end = rigComputed?.[endId];

        if (!root || !joint || !end) return [];

        const target =
            getPointFromLayers(inputs?.[0]) ??
            (node?.target && typeof node.target === 'object'
                ? {
                      x: safeNumber(node.target.x),
                      y: safeNumber(node.target.y),
                  }
                : null) ??
            {
                x: safeNumber(context?.parameters?.[node?.targetXParam] ?? node?.targetX ?? 0),
                y: safeNumber(context?.parameters?.[node?.targetYParam] ?? node?.targetY ?? 0),
            };

        const result = solveTwoBoneIK(root, joint, end, target);

        return [
            toLayer(`ik:${node.id}`, [
                {
                    controllerId: rootId,
                    channel: 'rotation',
                    value: result.rootAngle,
                },
                {
                    controllerId: jointId,
                    channel: 'rotation',
                    value: result.jointAngle,
                },
            ]),
        ];
    },

    passthrough(node, context, inputs) {
        return inputs[0] ?? [];
    },
};

export function getNodeEvaluator(type) {
    const evaluator = GRAPH_NODE_EVALUATORS[type];

    if (!evaluator) {
        throw new Error(`Unknown animation graph node type: ${type}`);
    }

    return evaluator;
}
