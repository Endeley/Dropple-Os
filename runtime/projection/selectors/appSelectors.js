import {
    getCurrentScreen,
    getNavigationState,
} from '@/runtime/navigation/index.js';
import { getMachineState } from '@/runtime/stateMachines/index.js';
import { getProjectedRuntimeViewState } from '../nonReactProjection.js';

export function selectNavigationState(graphId) {
    return getNavigationState(getProjectedRuntimeViewState(), graphId);
}

export function selectCurrentScreen(graphId) {
    return getCurrentScreen(getProjectedRuntimeViewState(), graphId);
}

export function selectMachineState(machineId) {
    return getMachineState(getProjectedRuntimeViewState(), machineId);
}
