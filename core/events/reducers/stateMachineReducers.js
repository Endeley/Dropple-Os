import { EventTypes } from '../eventTypes.js';

export function stateMachineReducers(state, event) {
    if (event.type !== EventTypes.STATE_MACHINE_TRANSITION) {
        return state;
    }

    const { machineId, target } = event.payload || {};
    const current = state?.stateMachines?.[machineId];

    if (!machineId || !target || current === undefined) {
        return state;
    }

    return {
        ...state,
        stateMachines: {
            ...(state.stateMachines || {}),
            [machineId]: target,
        },
    };
}
