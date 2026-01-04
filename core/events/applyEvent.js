// core/events/applyEvent.js

import { rootReducer } from "./reducers/index.js";

const initialState = Object.freeze({
    nodes: Object.freeze({}),
    rootIds: Object.freeze([]),
    timeline: Object.freeze({
        timelines: {},
    }),
});

export function applyEvent(state = initialState, event) {
  if (!event?.type) {
    throw new Error("Invalid event");
  }

  return rootReducer(state, event);
}
