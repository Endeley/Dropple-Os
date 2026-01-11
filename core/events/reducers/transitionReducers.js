// core/events/reducers/transitionReducers.js

import { EventTypes } from '../eventTypes.js';

/**
 * Transition reducers
 *
 * 🔒 Rules:
 * - Pure functions
 * - No validation side effects
 * - Deterministic updates only
 */
export function transitionReducers(state, event) {
    const { type, payload } = event;
    const prevTransitions = state.transitions || { byId: {}, byStatePair: {} };

    switch (type) {
        case EventTypes.TRANSITION_CREATE: {
            const t = payload;

            return {
                ...state,
                transitions: {
                    ...prevTransitions,
                    byId: {
                        ...prevTransitions.byId,
                        [t.id]: t,
                    },
                    byStatePair: {
                        ...prevTransitions.byStatePair,
                        [`${t.fromStateId}→${t.toStateId}`]: t.id,
                    },
                },
            };
        }

        case EventTypes.TRANSITION_UPDATE: {
            const { id, patch } = payload;
            const prev = prevTransitions.byId?.[id];
            if (!prev) return state;

            return {
                ...state,
                transitions: {
                    ...prevTransitions,
                    byId: {
                        ...prevTransitions.byId,
                        [id]: {
                            ...prev,
                            ...patch,
                        },
                    },
                },
            };
        }

        case EventTypes.TRANSITION_DELETE: {
            const nextById = { ...prevTransitions.byId };
            delete nextById[payload.id];

            return {
                ...state,
                transitions: {
                    ...prevTransitions,
                    byId: nextById,
                },
            };
        }

        default:
            return state;
    }
}
