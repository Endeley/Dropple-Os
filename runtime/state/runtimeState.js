import { createTimeline } from '@/timeline/schema/timeline.js';

export const initialRuntimeState = {
    nodes: {},
    rootIds: [],
    timeline: null,
    activeStateId: null,
    activeComponentId: null,
    __isReplaying: false,
};

const runtimeState = {
    current: undefined,
    __isReplaying: false,
};
let lastError = null;

export function getRuntimeState() {
    return runtimeState.current;
}

export function setRuntimeState(nextState) {
    runtimeState.current = nextState
        ? { ...nextState, __isReplaying: runtimeState.__isReplaying }
        : nextState;
    lastError = null;
    return runtimeState.current;
}

export function resetRuntimeState() {
    runtimeState.current = undefined;
    lastError = null;
}

export function setIsReplaying(value) {
    runtimeState.__isReplaying = Boolean(value);
    if (!runtimeState.current) {
        runtimeState.current = { ...initialRuntimeState, __isReplaying: runtimeState.__isReplaying };
        return;
    }
    runtimeState.current = { ...runtimeState.current, __isReplaying: runtimeState.__isReplaying };
}

export function setReplaying(isReplaying) {
    setIsReplaying(isReplaying);
}

export function getIsReplaying() {
    return runtimeState.__isReplaying;
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
