import { EventTypes } from '@/core/events/eventTypes.js';

export function stateMachineReducer(state, event) {
    if (event.type !== EventTypes.STATE_MACHINE_TRANSITION) {
        return state;
    }

    const { machineId, target } = event.payload || {};
    const current = state?.[machineId];

    if (current === undefined) {
        return state;
    }

    return {
        ...state,
        [machineId]: target,
    };
}
