import {
    getVisibleToolDefinitions,
    getVisibleTools,
    initialToolRuntimeState,
} from '@/runtime/tools/toolRuntime.js';

export function selectToolState(state) {
    return state?.tools ?? initialToolRuntimeState;
}

export function selectRegisteredTools(state) {
    return selectToolState(state).registeredTools ?? {};
}

export function selectVisibleTools(state) {
    return getVisibleTools(selectToolState(state));
}

export function selectVisibleToolDefinitions(state) {
    return getVisibleToolDefinitions(selectToolState(state));
}

export function selectActiveTool(state) {
    return selectToolState(state).activeTool ?? null;
}
