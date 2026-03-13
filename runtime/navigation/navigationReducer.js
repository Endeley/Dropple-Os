import { EventTypes } from '@/core/events/eventTypes.js';

export function navigationReducer(state, event) {
    if (event.type !== EventTypes.NAVIGATION_NAVIGATE) {
        return state;
    }

    const { graphId, target } = event.payload || {};
    const graphState = state?.[graphId];

    if (!graphId || !target || !graphState) {
        return state;
    }

    return {
        ...state,
        [graphId]: {
            ...graphState,
            current: target,
        },
    };
}
