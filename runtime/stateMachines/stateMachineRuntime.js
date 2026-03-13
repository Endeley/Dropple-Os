import { EventTypes } from '@/core/events/eventTypes.js';
import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';
import { getStateMachine } from './stateMachineRegistry.js';

export async function transition(machineId, target, { dispatcher } = {}) {
    const machine = getStateMachine(machineId);

    if (!machine) {
        throw new Error(`Unknown state machine ${machineId}`);
    }

    if (!machine.states.includes(target)) {
        throw new Error(`Invalid state ${target}`);
    }

    const activeDispatcher = dispatcher || getRuntimeDispatcher();

    return activeDispatcher.dispatch({
        type: EventTypes.STATE_MACHINE_TRANSITION,
        payload: {
            machineId,
            target,
        },
    });
}
