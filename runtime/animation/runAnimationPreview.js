import { evaluateMotion } from '@/engine/animation/evaluateMotion.js';
import { buildEvaluationInputs } from './buildEvaluationInputs.js';
import { useAnimatedRuntimeStore } from '../stores/useAnimatedRuntimeStore.js';
import { getRuntimeState } from '../state/runtimeState.js';
import { getNodes } from '../document/documentAdapter.js';

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
            ...getNodes(baseState),
        };

        Object.entries(motionResult).forEach(([nodeId, patch]) => {
            projectedNodes[nodeId] = {
                ...(projectedNodes[nodeId] || {}),
                ...patch,
            };
        });

        let cameraTransform = null;
        try {
            const renderInputs = buildEvaluationInputs(getRuntimeState(), {
                timeMs: time,
                strictSceneScope: false,
            });
            cameraTransform = renderInputs?.camera?.transform ?? null;
        } catch {
            cameraTransform = null;
        }

        useAnimatedRuntimeStore.setState(
            {
                previewNodes: projectedNodes,
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
                        previewNodes: {},
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
                    previewNodes: {},
                    cameraTransform: null,
                },
                false
            );
        },
    };
}
