import { applyEvent } from "../core/events/applyEvent.js";

const state0 = applyEvent(undefined, {
  type: "node/create",
  payload: { node: { id: "a", type: "frame" } },
});

const state1 = applyEvent(state0, {
  type: "node/create",
  payload: { node: { id: "b", type: "text" } },
});

const state2 = applyEvent(state1, {
  type: "node/attach",
  payload: { parentId: "a", childId: "b" },
});

console.log(JSON.stringify(state2, null, 2));
