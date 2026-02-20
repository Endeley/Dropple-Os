import { createPlaybackController } from '../animation/playbackController.js';
import { useAnimatedRuntimeStore } from '../stores/useAnimatedRuntimeStore.js';
import { getRuntimeState } from '../state/runtimeState.js';
import { createEventDispatcher } from '../dispatcher/dispatch.js';

const dispatcher = createEventDispatcher();

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

    dispatcher.hydrateRuntimeState({ nodes: {}, rootIds: [] }, { animate: false });
    dispatcher.setReplaying(true);

    controller.play({ fromState: {}, toState: {} });

    console.assert(
        animationController.calls.start === 0,
        'play() should be a no-op when __isReplaying is true'
    );

    dispatcher.setReplaying(false);
}

// Test 2: cancel() resets animated store to truth
{
    const animationController = createStubAnimationController();
    const controller = createPlaybackController({ animationController });

    const truth = { nodes: { a: { x: 1 } }, rootIds: ['a'] };
    dispatcher.hydrateRuntimeState(truth, { animate: false });

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
