// core/events/applyEvent.js

import { rootReducer } from "./reducers/index.js";
import { createTimeline } from "@/timeline/schema/timeline.js";

const initialState = Object.freeze({
    nodes: Object.freeze({}),
    rootIds: Object.freeze([]),
    // ✅ Always includes default timeline so animation reducers never no-op on replay
    timeline: Object.freeze({
        timelines: Object.freeze({
            default: createTimeline(),
        }),
    }),
    transitions: Object.freeze({
        component: Object.freeze({}),
        page: Object.freeze({}),
    }),
    interactions: Object.freeze({
        component: Object.freeze({}),
        page: Object.freeze([]),
    }),
});

function ensureDefaultTimeline(state) {
    if (!state?.timeline?.timelines?.default) {
        return {
            ...state,
            timeline: {
                timelines: {
                    ...(state?.timeline?.timelines || {}),
                    default: createTimeline(),
                },
            },
        };
    }
    return state;
}

export function applyEvent(state = initialState, event) {
    if (!event?.type) {
        throw new Error("Invalid event");
    }

    const safeState = ensureDefaultTimeline(state);
    return rootReducer(safeState, event);
}
