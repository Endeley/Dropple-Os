// runtime/animation/playbackController.js

import { getRuntimeState } from '../state/runtimeState.js';
import { useAnimatedRuntimeStore } from '../stores/useAnimatedRuntimeStore.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { buildTemporalContext } from '@/runtime/temporal/buildTemporalContext.js';

export function createPlaybackController({ animationController, dispatchEvent }) {
    let playing = false;
    let rafId = null;
    let startTime = 0;
    let pendingShotId = null;
    const hasAnimationFrame =
        typeof requestAnimationFrame === 'function' &&
        typeof cancelAnimationFrame === 'function';

    function isPlaying() {
        return playing;
    }

    function stopShotLoop() {
        if (rafId && hasAnimationFrame) cancelAnimationFrame(rafId);
        rafId = null;
        startTime = 0;
        pendingShotId = null;
        useAnimatedRuntimeStore.setState({ previewNodes: {}, cameraTransform: null }, false);
    }

    function tick(now) {
        if (!playing) return;
        if (!startTime) startTime = now;

        const elapsed = now - startTime;
        const runtime = getRuntimeState();
        const runtimeScene = runtime?.scene ?? null;

        if (runtime?.document && runtimeScene) {
            const temporalContext = buildTemporalContext({
                document: runtime.document,
                runtime: {
                    ...runtime,
                    playback: {
                        ...(runtime?.playback ?? {}),
                        timeMs: elapsed,
                    },
                },
            });
            const resolvedShotId = temporalContext?.activeShot?.shotId ?? null;

            if (pendingShotId && pendingShotId === runtimeScene.activeShotId) {
                pendingShotId = null;
            }

            if (
                resolvedShotId &&
                resolvedShotId !== runtimeScene.activeShotId &&
                resolvedShotId !== pendingShotId
            ) {
                if (typeof dispatchEvent === 'function') {
                    pendingShotId = resolvedShotId;
                    dispatchEvent({
                        type: EventTypes.SHOT_SET_ACTIVE,
                        payload: { shotId: resolvedShotId },
                    });
                }
            }

            useAnimatedRuntimeStore.setState(
                { cameraTransform: temporalContext?.camera?.transform ?? null },
                false
            );
        }

        if (hasAnimationFrame) {
            rafId = requestAnimationFrame(tick);
        }
    }

    function cancel() {
        if (!playing) return;
        animationController.cancel();
        playing = false;
        stopShotLoop();
    }

    function play({ fromState, toState, onComplete }) {
        const runtimeState = getRuntimeState();

        // 🔒 HARD GUARD — playback must never run during replay
        if (runtimeState?.__isReplaying) {
            return;
        }

        // Prevent overlapping playback
        cancel();

        playing = true;

        animationController.start(fromState, toState, {
            onComplete: () => {
                playing = false;
                stopShotLoop();
                if (typeof onComplete === 'function') {
                    onComplete();
                }
            },
        });

        if (rafId && hasAnimationFrame) cancelAnimationFrame(rafId);
        startTime = 0;
        if (hasAnimationFrame) {
            rafId = requestAnimationFrame(tick);
        }
    }

    return {
        play,
        cancel,
        isPlaying,
    };
}
