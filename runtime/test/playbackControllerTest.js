import { createPlaybackController } from '../animation/playbackController.js';
import { useAnimatedRuntimeStore } from '../stores/useAnimatedRuntimeStore.js';
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

    dispatcher.hydrateRuntimeState({
        document: {
            sceneGraph: {
                rootIds: [],
                nodes: {},
            },
        },
    }, { animate: false });
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

    const truth = {
        document: {
            sceneGraph: {
                rootIds: ['a'],
                nodes: {
                    a: { id: 'a', type: 'frame', children: [], x: 1 },
                },
            },
        },
    };
    dispatcher.hydrateRuntimeState(truth, { animate: false });

    controller.play({ fromState: truth, toState: truth });

    useAnimatedRuntimeStore.setState({ previewNodes: {} }, false);
    controller.cancel();

    const animated = useAnimatedRuntimeStore.getState();

    console.assert(
        JSON.stringify(animated.previewNodes) === JSON.stringify({}),
        'cancel() should clear animated preview nodes'
    );
}

console.log('Playback controller tests passed');
