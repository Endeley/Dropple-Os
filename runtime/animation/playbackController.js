// runtime/animation/playbackController.js

import { getRuntimeState } from '../state/runtimeState.js';
import { useAnimatedRuntimeStore } from '../stores/useAnimatedRuntimeStore.js';
import { resolveShotForTime } from '../scene/resolveShotForTime.js';
import { getCameraTransformAtTime } from '@/core/scene/cameraPlayback.v1.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { getSceneGraph } from '../document/documentAdapter.js';

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
        const sceneGraph = getSceneGraph(runtime);
        const runtimeScene = runtime?.scene ?? null;

        if (sceneGraph && runtimeScene) {
            const resolved = resolveShotForTime({
                sceneGraph,
                activeSceneId: runtimeScene.activeSceneId,
                globalTime: elapsed,
            });

            if (pendingShotId && pendingShotId === runtimeScene.activeShotId) {
                pendingShotId = null;
            }

            if (
                resolved?.shotId &&
                resolved.shotId !== runtimeScene.activeShotId &&
                resolved.shotId !== pendingShotId
            ) {
                if (typeof dispatchEvent === 'function') {
                    pendingShotId = resolved.shotId;
                    dispatchEvent({
                        type: EventTypes.SHOT_SET_ACTIVE,
                        payload: { shotId: resolved.shotId },
                    });
                }
            }

            const cameraTrack = resolved?.shot?.camera ?? null;
            const localTime = resolved?.localTime ?? elapsed;
            const cameraTransform = cameraTrack
                ? getCameraTransformAtTime(cameraTrack, localTime)
                : null;
            useAnimatedRuntimeStore.setState({ cameraTransform }, false);
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
