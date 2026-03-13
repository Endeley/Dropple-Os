import {
    getCurrentScreen,
    getNavigationState,
} from '@/runtime/navigation/index.js';
import { getMachineState } from '@/runtime/stateMachines/index.js';
import { getRuntimeSnapshot } from '../v1/runtimeSnapshot.js';

export function selectNavigationState(graphId) {
    return getNavigationState(getRuntimeSnapshot(), graphId);
}

export function selectCurrentScreen(graphId) {
    return getCurrentScreen(getRuntimeSnapshot(), graphId);
}

export function selectMachineState(machineId) {
    return getMachineState(getRuntimeSnapshot(), machineId);
}
