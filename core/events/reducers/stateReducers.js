import { EventTypes } from '../eventTypes.js';

/**
 * State identity reducer
 *
 * 🔒 Rules:
 * - Pure
 * - Deterministic
 * - No side effects
 * - No validation logic
 */
export function stateReducers(state, event) {
    if (event.type !== EventTypes.STATE_SET) return state;

    const { stateId } = event.payload || {};
    if (!stateId) return state;

    return {
        ...state,
        activeStateId: stateId,
    };
}
