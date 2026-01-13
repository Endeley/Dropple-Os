// runtime/animation/playbackController.js

import { getRuntimeState } from '../state/runtimeState.js';
import { useAnimatedRuntimeStore } from '../stores/useAnimatedRuntimeStore.js';

export function createPlaybackController({ animationController }) {
    let playing = false;

    function isPlaying() {
        return playing;
    }

    function cancel() {
        if (!playing) return;
        animationController.cancel();
        playing = false;

        const truth = getRuntimeState();
        useAnimatedRuntimeStore.setState(
            {
                nodes: truth?.nodes || {},
                rootIds: truth?.rootIds || [],
            },
            false
        );
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
                const truth = getRuntimeState();
                useAnimatedRuntimeStore.setState(
                    {
                        nodes: truth?.nodes || {},
                        rootIds: truth?.rootIds || [],
                    },
                    false
                );
                if (typeof onComplete === 'function') {
                    onComplete();
                }
            },
        });
    }

    return {
        play,
        cancel,
        isPlaying,
    };
}
