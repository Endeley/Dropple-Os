import { createEventDispatcher } from "../runtime/eventDispatcher.js";
import { EventTypes } from "../core/events/eventTypes.js";

const runtime = createEventDispatcher();

runtime.dispatch({
  type: EventTypes.NODE_CREATE,
  payload: { node: { id: "a", type: "frame" } },
});

runtime.dispatch({
  type: EventTypes.NODE_CREATE,
  payload: { node: { id: "b", type: "text" } },
});

runtime.dispatch({
  type: EventTypes.NODE_ATTACH,
  payload: { parentId: "a", childId: "b" },
});

console.log("STATE:", runtime.getState());

runtime.undo();
console.log("UNDO:", runtime.getState());

runtime.redo();
console.log("REDO:", runtime.getState());
