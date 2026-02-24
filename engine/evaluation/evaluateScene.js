import { extractChannels } from './extractChannels.js';

function toFiniteNumber(value, fallback = 0) {
    return Number.isFinite(value) ? value : fallback;
}

function roundTo5(value) {
    return Number(value.toFixed(5));
}

function normalizeVisibility(value) {
    if (value == null) return true;
    return Boolean(value);
}

function assertNodeInvariant(node) {
    if (typeof node.id !== 'string' || node.id.length === 0) {
        throw new Error('evaluateScene: node.id must be a non-empty string');
    }
    if (typeof node.type !== 'string' || node.type.length === 0) {
        throw new Error('evaluateScene: node.type must be a non-empty string');
    }
    if (node.transform != null) {
        if (typeof node.transform !== 'object') {
            throw new Error('evaluateScene: node.transform must be an object when provided');
        }
        if ('x' in node.transform) {
            const x = node.transform.x;
            const isNumber = Number.isFinite(x);
            const isKeyframes = Boolean(x && typeof x === 'object' && 'keyframes' in x);
            if (!isNumber && !isKeyframes) {
                throw new Error(
                    'evaluateScene: node.transform.x must be a finite number or keyframes when provided'
                );
            }
        }
        if ('y' in node.transform) {
            const y = node.transform.y;
            const isNumber = Number.isFinite(y);
            const isKeyframes = Boolean(y && typeof y === 'object' && 'keyframes' in y);
            if (!isNumber && !isKeyframes) {
                throw new Error(
                    'evaluateScene: node.transform.y must be a finite number or keyframes when provided'
                );
            }
        }
    }
    if (node.opacity != null) {
        const opacity = node.opacity;
        const isNumber = Number.isFinite(opacity);
        const isKeyframes = Boolean(opacity && typeof opacity === 'object' && 'keyframes' in opacity);
        if (!isNumber && !isKeyframes) {
            throw new Error(
                'evaluateScene: node.opacity must be a finite number or keyframes when provided'
            );
        }
    }
    if (node.visibility != null && typeof node.visibility !== 'boolean') {
        throw new Error('evaluateScene: node.visibility must be a boolean when provided');
    }
    if (node.children != null && !Array.isArray(node.children)) {
        throw new Error('evaluateScene: node.children must be an array when provided');
    }
}

function assertTransformInvariant(transform, label) {
    if (transform == null) return;
    if (typeof transform !== 'object') {
        throw new Error(`evaluateScene: ${label} must be an object when provided`);
    }
    const fields = ['x', 'y', 'scale'];
    for (const field of fields) {
        if (!(field in transform)) continue;
        const value = transform[field];
        const isNumber = Number.isFinite(value);
        const isKeyframes = Boolean(value && typeof value === 'object' && 'keyframes' in value);
        if (!isNumber && !isKeyframes) {
            throw new Error(
                `evaluateScene: ${label}.${field} must be a finite number or keyframes when provided`
            );
        }
    }
}

function easeValue(t, easing) {
    const clamped = Math.max(0, Math.min(1, t));
    if (easing === 'linear') return clamped;
    if (easing === 'easeInOut') {
        return clamped * clamped * (3 - 2 * clamped);
    }
    throw new Error(`evaluateScene: unknown easing '${easing}'`);
}

function resolveNumericValue(input, timeMs, label) {
    if (Number.isFinite(input)) return roundTo5(input);

    if (input && typeof input === 'object' && Array.isArray(input.keyframes)) {
        const { keyframes } = input;
        if (keyframes.length < 1) {
            throw new Error(`evaluateScene: ${label} keyframes must have at least one entry`);
        }

        for (let i = 0; i < keyframes.length; i += 1) {
            const frame = keyframes[i];
            if (!frame || typeof frame !== 'object') {
                throw new Error(`evaluateScene: ${label} keyframes must be objects`);
            }
            const time = frame.t ?? frame.time;
            const value = frame.v ?? frame.value;
            if (!Number.isFinite(time) || !Number.isFinite(value)) {
                throw new Error(`evaluateScene: ${label} keyframes require finite time and value`);
            }
            const easing = frame.easing ?? 'linear';
            if (easing !== 'linear' && easing !== 'easeInOut') {
                throw new Error(`evaluateScene: ${label} keyframes easing must be linear or easeInOut`);
            }
            const prevTime = keyframes[i - 1]?.t ?? keyframes[i - 1]?.time;
            if (i > 0 && time <= prevTime) {
                throw new Error(`evaluateScene: ${label} keyframes must be strictly ascending`);
            }
        }

        const first = keyframes[0];
        const last = keyframes[keyframes.length - 1];
        const firstTime = first.t ?? first.time;
        const lastTime = last.t ?? last.time;
        const firstValue = first.v ?? first.value;
        const lastValue = last.v ?? last.value;

        if (timeMs <= firstTime) return roundTo5(firstValue);
        if (timeMs >= lastTime) return roundTo5(lastValue);

        for (let i = 0; i < keyframes.length - 1; i += 1) {
            const k1 = keyframes[i];
            const k2 = keyframes[i + 1];
            const t1 = k1.t ?? k1.time;
            const t2 = k2.t ?? k2.time;
            if (timeMs >= t1 && timeMs <= t2) {
                const span = t2 - t1;
                const ratio = span === 0 ? 0 : (timeMs - t1) / span;
                const eased = easeValue(ratio, k2.easing ?? 'linear');
                const v1 = k1.v ?? k1.value;
                const v2 = k2.v ?? k2.value;
                return roundTo5(v1 + eased * (v2 - v1));
            }
        }
    }

    throw new Error(`evaluateScene: ${label} must be a finite number or keyframes`);
}

function evaluateNode(node, parentState, timeMs) {
    if (!node || typeof node !== 'object') return null;

    assertNodeInvariant(node);

    const channels = extractChannels(node);
    const resolveChannelValue = (channel, fallback, label) => {
        if (!channel) return fallback;
        if ('keyframes' in channel) {
            return resolveNumericValue({ keyframes: channel.keyframes }, timeMs, label);
        }
        if ('value' in channel) {
            return resolveNumericValue(channel.value, timeMs, label);
        }
        return fallback;
    };

    const localX = resolveChannelValue(channels['transform.x'], 0, 'transform.x');
    const localY = resolveChannelValue(channels['transform.y'], 0, 'transform.y');
    const worldX = roundTo5(parentState.worldX + localX);
    const worldY = roundTo5(parentState.worldY + localY);

    const localOpacity = resolveChannelValue(channels.opacity, 1, 'opacity');
    const opacity = roundTo5(parentState.opacity * localOpacity);

    const visibility = parentState.visibility && normalizeVisibility(node.visibility);

    const viewX = roundTo5((worldX - parentState.cameraX) * parentState.cameraScale);
    const viewY = roundTo5((worldY - parentState.cameraY) * parentState.cameraScale);

    const childrenIn = Array.isArray(node.children) ? node.children : [];
    const children = childrenIn
        .map((child) =>
            evaluateNode(child, {
                worldX,
                worldY,
                opacity,
                visibility,
                cameraX: parentState.cameraX,
                cameraY: parentState.cameraY,
                cameraScale: parentState.cameraScale,
            }, timeMs)
        )
        .filter(Boolean);

    return {
        id: node.id ?? null,
        type: node.type ?? null,
        worldTransform: { x: worldX, y: worldY },
        viewTransform: { x: viewX, y: viewY },
        opacity,
        visibility,
        children,
    };
}

function deepFreeze(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    Object.freeze(obj);
    if (Array.isArray(obj)) {
        for (const item of obj) deepFreeze(item);
    } else {
        for (const key of Object.keys(obj)) {
            deepFreeze(obj[key]);
        }
    }
    return obj;
}

export function evaluateScene(scene, timeMs, options = {}) {
    if (!scene) return null;

    const cameraTransform = options?.cameraTransform ?? null;
    assertTransformInvariant(cameraTransform, 'cameraTransform');
    const cameraX =
        cameraTransform && 'x' in cameraTransform
            ? resolveNumericValue(cameraTransform.x, timeMs, 'cameraTransform.x')
            : 0;
    const cameraY =
        cameraTransform && 'y' in cameraTransform
            ? resolveNumericValue(cameraTransform.y, timeMs, 'cameraTransform.y')
            : 0;
    const cameraScale =
        cameraTransform && 'scale' in cameraTransform
            ? resolveNumericValue(cameraTransform.scale, timeMs, 'cameraTransform.scale')
            : 1;

    const rootState = {
        worldX: 0,
        worldY: 0,
        opacity: 1,
        visibility: true,
        cameraX,
        cameraY,
        cameraScale,
    };

    let evaluated = null;

    if (Array.isArray(scene)) {
        evaluated = {
            __evaluatedSchemaVersion: 1,
            children: scene.map((node) => evaluateNode(node, rootState, timeMs)).filter(Boolean),
        };
    } else {
        evaluated = evaluateNode(scene, rootState, timeMs);
        if (evaluated) {
            evaluated = {
                __evaluatedSchemaVersion: 1,
                ...evaluated,
            };
        }
    }

    if (process.env.NODE_ENV !== 'production') {
        return deepFreeze(evaluated);
    }

    return evaluated;
}
