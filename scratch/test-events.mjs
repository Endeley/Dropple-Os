import { replayEvents } from "../runtime/dispatcher/replayEvents.js";

const state = replayEvents({
  events: [
    {
      type: "node/create",
      payload: { node: { id: "a", type: "frame" } },
    },
    {
      type: "node/create",
      payload: { node: { id: "b", type: "text" } },
    },
    {
      type: "node/attach",
      payload: { parentId: "a", childId: "b" },
    },
  ],
});

console.log(JSON.stringify(state, null, 2));
