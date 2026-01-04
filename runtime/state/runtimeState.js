import { createTimeline } from '@/timeline/schema/timeline.js';

const runtimeState = {
    current: undefined,
};

export function getRuntimeState() {
    return runtimeState.current;
}

export function setRuntimeState(nextState) {
    runtimeState.current = nextState;
    return runtimeState.current;
}

export function resetRuntimeState() {
    runtimeState.current = undefined;
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
