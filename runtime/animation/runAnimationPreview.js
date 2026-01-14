import { evaluateAnimation } from '@/engine/animation/evaluateAnimation.js';
import { useAnimatedRuntimeStore } from '../stores/useAnimatedRuntimeStore.js';
import { getRuntimeState } from '../state/runtimeState.js';

export function runAnimationPreview({
    fromState,
    timeline,
    durationMs = 300,
    onComplete,
}) {
    let rafId = null;
    let startTime = null;
    let cancelled = false;

    const runtimeState = getRuntimeState();

    // 🔒 Guard: never preview during replay
    if (runtimeState?.__isReplaying) {
        return { cancel: () => {} };
    }

    function tick(now) {
        if (cancelled) return;

        if (startTime == null) {
            startTime = now;
        }

        const elapsed = now - startTime;
        const clamped = Math.min(elapsed, durationMs);

        const animatedValues = evaluateAnimation({
            timeline,
            timeMs: clamped,
        });

        const baseNodes = fromState?.nodes || {};
        const projectedNodes = { ...baseNodes };

        for (const nodeId in animatedValues) {
            projectedNodes[nodeId] = {
                ...projectedNodes[nodeId],
                ...animatedValues[nodeId],
            };
        }

        useAnimatedRuntimeStore.setState(
            {
                nodes: projectedNodes,
                rootIds: fromState?.rootIds || [],
            },
            false
        );

        if (elapsed < durationMs) {
            rafId = requestAnimationFrame(tick);
        } else {
            cleanup();
            if (typeof onComplete === 'function') {
                onComplete();
            }
        }
    }

    function cleanup() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        cancelled = true;
    }

    rafId = requestAnimationFrame(tick);

    return {
        cancel() {
            cleanup();

            // Restore truth projection
            const truth = getRuntimeState();
            useAnimatedRuntimeStore.setState(
                {
                    nodes: truth?.nodes || {},
                    rootIds: truth?.rootIds || [],
                },
                false
            );
        },
    };
}
