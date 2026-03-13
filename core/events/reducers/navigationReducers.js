import { EventTypes } from '../eventTypes.js';

export function navigationReducers(state, event) {
    if (event.type !== EventTypes.NAVIGATION_NAVIGATE) {
        return state;
    }

    const { graphId, target } = event.payload || {};
    const graphState = state?.navigation?.[graphId];

    if (!graphId || !target || !graphState) {
        return state;
    }

    return {
        ...state,
        navigation: {
            ...(state.navigation || {}),
            [graphId]: {
                ...graphState,
                current: target,
            },
        },
    };
}
