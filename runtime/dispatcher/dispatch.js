// runtime/dispatcher/dispatch.js

import { applyEvent } from '../../core/events/applyEvent.js';
import { syncRuntimeToZustand } from '../bridge/zustandBridge.js';
import { createHistory } from './history.js';
import { getRuntimeState, resetRuntimeState, setRuntimeState } from '../state/runtimeState.js';

export function createEventDispatcher({ maxHistory = 100 } = {}) {
    const history = createHistory(maxHistory);

    function commit(nextState) {
        setRuntimeState(nextState);
        syncRuntimeToZustand(nextState);
        return nextState;
    }

    function dispatch(event) {
        const prev = getRuntimeState();
        const next = applyEvent(prev, event);

        if (next === prev) return next;

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
