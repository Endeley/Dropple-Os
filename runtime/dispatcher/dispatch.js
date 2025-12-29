// runtime/dispatcher/dispatch.js

import { applyEvent } from '../../core/events/applyEvent.js';
import { applyLayoutPass } from '../layout/applyLayoutPass.js';
import { createAnimationController } from '../animation/animationController.js';
import { interpolateNodes } from '../animation/interpolateNodes.js';
import { easeOutCubic } from '../animation/easing.js';
import { useAnimatedRuntimeStore } from '../stores/useAnimatedRuntimeStore.js';
import { syncRuntimeToZustand } from '../bridge/zustandBridge.js';
import { createHistory } from './history.js';
import { getRuntimeState, resetRuntimeState, setRuntimeState } from '../state/runtimeState.js';

export function createEventDispatcher({ maxHistory = 100 } = {}) {
    const history = createHistory(maxHistory);
    const animationController = createAnimationController({
        duration: 220,
        easing: easeOutCubic,
        onFrame: (fromState, toState, t) => {
            if (!fromState || !toState) return;
            const animatedNodes = interpolateNodes(fromState.nodes || {}, toState.nodes || {}, t);
            useAnimatedRuntimeStore.setState(
                {
                    nodes: animatedNodes,
                    rootIds: toState.rootIds,
                },
                false
            );
        },
    });

    function commit(nextState) {
        const prev = getRuntimeState();

        setRuntimeState(nextState);

        animationController.start(prev, nextState);

        syncRuntimeToZustand(nextState);
        useAnimatedRuntimeStore.setState(
            {
                nodes: nextState?.nodes || {},
                rootIds: nextState?.rootIds || [],
            },
            false
        );
        return nextState;
    }

    function dispatch(event) {
        const prev = getRuntimeState();
        let next = applyEvent(prev, event);

        if (next === prev) return next;

        // 🔐 AUTO-LAYOUT RUNS HERE
        next = applyLayoutPass(next);

        history.push(next);
        return commit(next);
    }

    function undo() {
        const next = history.undo();
        return commit(next);
    }

    function redo() {
        const next = history.redo();
        return commit(next);
    }

    function reset() {
        history.reset();
        resetRuntimeState();
        syncRuntimeToZustand({ nodes: {}, rootIds: [] });
    }

    function getState() {
        return getRuntimeState();
    }

    return {
        dispatch,
        undo,
        redo,
        reset,
        getState,
    };
}
