import { EventTypes } from '../eventTypes.js';

/**
 * Interaction reducers
 *
 * 🔒 Rules:
 * - Pure
 * - Deterministic
 * - Metadata only
 * - No execution
 */
export function interactionReducers(state, event) {
    const { type, payload } = event;

    if (!payload) return state;

    const { interaction, interactionId, scope, sourceId } = payload;

    switch (type) {
        case EventTypes.INTERACTION_CREATE: {
            if (!interaction || !scope) return state;

            if (scope === 'component' && sourceId) {
                const list = state.interactions.component[sourceId] || [];

                return {
                    ...state,
                    interactions: {
                        ...state.interactions,
                        component: {
                            ...state.interactions.component,
                            [sourceId]: [...list, interaction],
                        },
                    },
                };
            }

            if (scope === 'page') {
                return {
                    ...state,
                    interactions: {
                        ...state.interactions,
                        page: [...state.interactions.page, interaction],
                    },
                };
            }

            return state;
        }

        case EventTypes.INTERACTION_UPDATE: {
            if (!interactionId || !scope) return state;

            const updateList = (list) =>
                list.map((i) => (i.id === interactionId ? { ...i, ...interaction } : i));

            if (scope === 'component' && sourceId) {
                const list = state.interactions.component[sourceId] || [];

                return {
                    ...state,
                    interactions: {
                        ...state.interactions,
                        component: {
                            ...state.interactions.component,
                            [sourceId]: updateList(list),
                        },
                    },
                };
            }

            if (scope === 'page') {
                return {
                    ...state,
                    interactions: {
                        ...state.interactions,
                        page: updateList(state.interactions.page),
                    },
                };
            }

            return state;
        }

        case EventTypes.INTERACTION_DELETE: {
            if (!interactionId || !scope) return state;

            const filterList = (list) => list.filter((i) => i.id !== interactionId);

            if (scope === 'component' && sourceId) {
                const list = state.interactions.component[sourceId] || [];

                return {
                    ...state,
                    interactions: {
                        ...state.interactions,
                        component: {
                            ...state.interactions.component,
                            [sourceId]: filterList(list),
                        },
                    },
                };
            }

            if (scope === 'page') {
                return {
                    ...state,
                    interactions: {
                        ...state.interactions,
                        page: filterList(state.interactions.page),
                    },
                };
            }

            return state;
        }

        default:
            return state;
    }
}
