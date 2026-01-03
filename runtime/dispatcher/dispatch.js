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
import { perfStart, perfEnd } from '@/perf/perfTracker';

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
        perfStart('dispatch');
        const prev = getRuntimeState();
        let next = applyEvent(prev, event);

        if (next === prev) return next;

        // 🔐 AUTO-LAYOUT RUNS HERE
        perfStart('layout');
        next = applyLayoutPass(next);
        const layoutMs = perfEnd('layout');

        history.push(next);
        const committed = commit(next);
        const t = perfEnd('dispatch');
        if (t > 8) {
            console.warn('dispatch slow:', t.toFixed(2), event.type, 'layout:', layoutMs?.toFixed(2));
        }
        return committed;
    }

    function undo() {
        perfStart('undo');
        const next = history.undo();
        const committed = commit(next);
        const t = perfEnd('undo');
        if (t > 5) {
            console.warn('undo slow:', t.toFixed(2));
        }
        return committed;
    }

    function redo() {
        perfStart('redo');
        const next = history.redo();
        const committed = commit(next);
        const t = perfEnd('redo');
        if (t > 5) {
            console.warn('redo slow:', t.toFixed(2));
        }
        return committed;
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
