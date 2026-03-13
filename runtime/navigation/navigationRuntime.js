import { EventTypes } from '@/core/events/eventTypes.js';
import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';
import { getNavigationGraph } from './navigationRegistry.js';
import { getCurrentScreen } from './navigationSelectors.js';

export async function navigate(graphId, target, { dispatcher, runtimeState } = {}) {
    const graph = getNavigationGraph(graphId);

    if (!graph) {
        throw new Error(`Navigation graph ${graphId} not found`);
    }

    if (!graph.screens?.includes(target)) {
        throw new Error(`Invalid screen ${target}`);
    }

    const activeDispatcher = dispatcher || getRuntimeDispatcher();
    const state = runtimeState || activeDispatcher?.getState?.();
    const current = getCurrentScreen(state, graphId) ?? graph.initial ?? null;
    const allowedTargets = graph.transitions?.[current] || [];

    if (current && allowedTargets.length > 0 && !allowedTargets.includes(target)) {
        throw new Error(`Invalid navigation transition ${current} -> ${target}`);
    }

    return activeDispatcher.dispatch({
        type: EventTypes.NAVIGATION_NAVIGATE,
        payload: {
            graphId,
            target,
        },
    });
}
