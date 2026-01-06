import { createTimeline } from '@/timeline/schema/timeline.js';

const runtimeState = {
    current: undefined,
};
let lastError = null;

export function getRuntimeState() {
    return runtimeState.current;
}

export function setRuntimeState(nextState) {
    runtimeState.current = nextState;
    lastError = null;
    return runtimeState.current;
}

export function resetRuntimeState() {
    runtimeState.current = undefined;
    lastError = null;
}

export function ensureDefaultTimeline(state) {
    if (!state?.timeline?.timelines?.default) {
        return {
            ...state,
            timeline: {
                timelines: {
                    default: createTimeline(),
                },
            },
        };
    }
    return state;
}

export function setRuntimeError(err) {
    lastError = err;
}

export function getRuntimeError() {
    return lastError;
}
