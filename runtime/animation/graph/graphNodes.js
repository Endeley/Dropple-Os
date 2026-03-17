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
