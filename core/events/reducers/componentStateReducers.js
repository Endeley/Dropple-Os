import { EventTypes } from '../eventTypes.js';

/**
 * Component identity reducer
 *
 * 🔒 Rules:
 * - Pure
 * - Deterministic
 * - No side effects
 * - No validation logic
 */
export function componentStateReducers(state, event) {
    if (event.type !== EventTypes.COMPONENT_SET_ACTIVE) return state;

    const { componentId } = event.payload || {};
    if (!componentId) return state;

    return {
        ...state,
        activeComponentId: componentId,
    };
}
