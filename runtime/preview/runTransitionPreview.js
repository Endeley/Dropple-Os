import { createAnimationController } from '@/runtime/animation/animationController.js';
import { interpolateNodes } from '@/runtime/animation/interpolateNodes.js';
import { easeInOut, easeOutCubic } from '@/runtime/animation/easing.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';

function resolveEasing(easing) {
    switch (easing) {
        case 'ease-in':
            return (t) => t * t;
        case 'ease-out':
            return easeOutCubic;
        case 'ease-in-out':
            return easeInOut;
        case 'linear':
        default:
            return (t) => t;
    }
}

function lerp(a = 0, b = 0, t) {
    return a + (b - a) * t;
}

function interpolateForTransition({ fromNodes, toNodes, t, properties }) {
    const propertySet = new Set(properties || []);
    const interpolated = {};

    Object.keys(toNodes || {}).forEach((id) => {
        const from = fromNodes?.[id];
        const to = toNodes?.[id];
        if (!from || !to) {
            interpolated[id] = to;
            return;
        }

        const next = { ...to };

        if (propertySet.has('x')) next.x = lerp(from.x, to.x, t);
        if (propertySet.has('y')) next.y = lerp(from.y, to.y, t);
        if (propertySet.has('width')) next.width = lerp(from.width, to.width, t);
        if (propertySet.has('height')) next.height = lerp(from.height, to.height, t);
        if (propertySet.has('opacity')) next.opacity = lerp(from.opacity ?? 1, to.opacity ?? 1, t);
        if (propertySet.has('scale')) next.scale = lerp(from.scale ?? 1, to.scale ?? 1, t);
        if (propertySet.has('rotation')) next.rotation = lerp(from.rotation ?? 0, to.rotation ?? 0, t);

        interpolated[id] = next;
    });

    return interpolated;
}

/**
 * Read-only transition preview. Writes only to the animated store.
 */
export function runTransitionPreview({ fromState, toState, transition, onComplete }) {
    if (!fromState || !toState || !transition) {
        return { cancel() {} };
    }

    const durationMs = transition.durationMs;
    if (!Number.isFinite(durationMs) || durationMs <= 0) {
        useAnimatedRuntimeStore.setState(
            {
                nodes: toState.nodes || {},
                rootIds: toState.rootIds || [],
            },
            false
        );
        onComplete?.(toState);
        return { cancel() {} };
    }

    let cancelled = false;
    let completed = false;

    const easing = resolveEasing(transition.easing);
    const controller = createAnimationController({
        duration: durationMs,
        easing,
        onFrame: (from, to, t) => {
            if (cancelled) return;

            const nodes =
                transition?.properties?.length
                    ? interpolateForTransition({
                          fromNodes: from?.nodes || {},
                          toNodes: to?.nodes || {},
                          t,
                          properties: transition.properties,
                      })
                    : interpolateNodes(from?.nodes || {}, to?.nodes || {}, t);

            useAnimatedRuntimeStore.setState(
                {
                    nodes,
                    rootIds: to?.rootIds || [],
                },
                false
            );

            if (t >= 1 && !completed) {
                completed = true;
                onComplete?.(toState);
            }
        },
    });

    controller.start(fromState, toState);

    return {
        cancel() {
            if (cancelled) return;
            cancelled = true;
            controller.cancel();
        },
    };
}
