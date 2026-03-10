import { evaluateMotion } from '@/engine/animation/evaluateMotion.js';
import { useAnimatedRuntimeStore } from '../stores/useAnimatedRuntimeStore.js';
import { getRuntimeState } from '../state/runtimeState.js';
import { getCameraTransformAtTime } from '@/core/scene/cameraPlayback.v1.js';

export function runAnimationPreview({
    fromState,
    timeline,
    designState,
    timeMs,
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

    function evaluateAtTime(time) {
        const baseState = designState || fromState;
        const motionResult = evaluateMotion(baseState?.document, time);
        const projectedNodes = {
            ...(baseState?.nodes || {}),
        };

        Object.entries(motionResult).forEach(([nodeId, patch]) => {
            projectedNodes[nodeId] = {
                ...(projectedNodes[nodeId] || {}),
                ...patch,
            };
        });

        const cameraTrack = getRuntimeState()?.scene?.camera ?? null;
        const cameraTransform = cameraTrack
            ? getCameraTransformAtTime(cameraTrack, time)
            : null;

        useAnimatedRuntimeStore.setState(
            {
                nodes: projectedNodes,
                rootIds: baseState?.rootIds || [],
                cameraTransform,
            },
            false
        );
    }

    if (Number.isFinite(timeMs)) {
        evaluateAtTime(timeMs);
        return {
            cancel() {
                useAnimatedRuntimeStore.setState(
                    {
                        nodes: {},
                        rootIds: [],
                        cameraTransform: null,
                    },
                    false
                );
            },
        };
    }

    function tick(now) {
        if (cancelled) return;

        if (startTime == null) {
            startTime = now;
        }

        const elapsed = now - startTime;
        const clamped = Math.min(elapsed, durationMs);

        evaluateAtTime(clamped);

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
        useAnimatedRuntimeStore.setState({ cameraTransform: null }, false);
    }

    rafId = requestAnimationFrame(tick);

    return {
        cancel() {
            cleanup();

            useAnimatedRuntimeStore.setState(
                {
                    nodes: {},
                    rootIds: [],
                    cameraTransform: null,
                },
                false
            );
        },
    };
}
