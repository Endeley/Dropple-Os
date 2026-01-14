import { createPlaybackController } from '../animation/playbackController.js';
import { useAnimatedRuntimeStore } from '../stores/useAnimatedRuntimeStore.js';
import { getRuntimeState, setIsReplaying, setRuntimeState } from '../state/runtimeState.js';

function createStubAnimationController() {
    const calls = { start: 0, cancel: 0 };
    return {
        calls,
        start() {
            calls.start += 1;
        },
        cancel() {
            calls.cancel += 1;
        },
    };
}

// Test 1: play() is a no-op during replay
{
    const animationController = createStubAnimationController();
    const controller = createPlaybackController({ animationController });

    setRuntimeState({ nodes: {}, rootIds: [] });
    setIsReplaying(true);

    controller.play({ fromState: {}, toState: {} });

    console.assert(
        animationController.calls.start === 0,
        'play() should be a no-op when __isReplaying is true'
    );

    setIsReplaying(false);
}

// Test 2: cancel() resets animated store to truth
{
    const animationController = createStubAnimationController();
    const controller = createPlaybackController({ animationController });

    const truth = { nodes: { a: { x: 1 } }, rootIds: ['a'] };
    setRuntimeState(truth);

    controller.play({ fromState: truth, toState: truth });

    useAnimatedRuntimeStore.setState({ nodes: {}, rootIds: [] }, false);
    controller.cancel();

    const animated = useAnimatedRuntimeStore.getState();
    const runtime = getRuntimeState();

    console.assert(
        JSON.stringify(animated.nodes) === JSON.stringify(runtime.nodes),
        'cancel() should reset animated nodes to runtime truth'
    );
    console.assert(
        JSON.stringify(animated.rootIds) === JSON.stringify(runtime.rootIds),
        'cancel() should reset animated rootIds to runtime truth'
    );
}

console.log('Playback controller tests passed');
