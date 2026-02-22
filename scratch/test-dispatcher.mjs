import { createEventDispatcher } from "../runtime/eventDispatcher.js";
import { EventTypes } from "../core/events/eventTypes.js";
import crypto from "crypto";

const runtime = createEventDispatcher();

const initialSeedState = {
  nodes: {
    nodeA: {
      id: "nodeA",
      type: "frame",
      layout: { x: 0, y: 0, width: 100, height: 100 },
      style: { opacity: 1 },
      content: {},
      transform: {},
    },
  },
  rootIds: ["nodeA"],
  behaviors: {
    nodeA: {
      baseStateId: "idle",
      states: [
        {
          id: "idle",
          label: "Idle",
          propertyOverrides: { style: { opacity: 1 } },
        },
        {
          id: "hover",
          label: "Hover",
          propertyOverrides: { style: { opacity: 0.5 } },
        },
      ],
      transitions: [
        {
          id: "idle-hover",
          fromStateId: "idle",
          toStateId: "hover",
          meta: { presetId: "ease" },
        },
      ],
      triggers: [
        {
          id: "idle-hover",
          triggerType: "pointer_enter",
          fromStateId: "idle",
          toStateId: "hover",
        },
      ],
    },
  },
  behaviorRuntime: {},
};

runtime.hydrateRuntimeState(initialSeedState, { animate: false });

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

await runtime.dispatch({
  type: EventTypes.BEHAVIOR_STATE_COMMIT,
  payload: { entityId: "nodeA", targetStateId: "hover" },
});

console.log("BEHAVIOR STATE:", runtime.getState().behaviorRuntime?.nodeA);
console.log("NODE A OPACITY:", runtime.getState().nodes?.nodeA?.style?.opacity);

console.log("STATE:", runtime.getState());

runtime.undo();
console.log("UNDO OPACITY:", runtime.getState().nodes.nodeA.style.opacity);
console.log("UNDO STATE:", runtime.getState().behaviorRuntime.nodeA);
console.log("UNDO:", runtime.getState());

runtime.redo();
console.log("REDO OPACITY:", runtime.getState().nodes.nodeA.style.opacity);
console.log("REDO STATE:", runtime.getState().behaviorRuntime.nodeA);
console.log("REDO:", runtime.getState());

runtime.dispatch({
  type: EventTypes.WORKSPACE_SET_ACTIVE,
  payload: { id: "uiux" },
});

await runtime.dispatch({
  type: EventTypes.BEHAVIOR_TRIGGER_FIRE,
  payload: {
    entityId: "nodeA",
    triggerType: "pointer_enter",
  },
});

console.log(
  "TRIGGER FIRE STATE (UIUX):",
  runtime.getState().behaviorRuntime?.nodeA
);
console.log(
  "TRIGGER FIRE OPACITY (UIUX):",
  runtime.getState().nodes?.nodeA?.style?.opacity
);

runtime.dispatch({
  type: EventTypes.WORKSPACE_SET_ACTIVE,
  payload: { id: "animation" },
});

await runtime.dispatch({
  type: EventTypes.BEHAVIOR_STATE_COMMIT,
  payload: { entityId: "nodeA", targetStateId: "idle" },
});

await runtime.dispatch({
  type: EventTypes.BEHAVIOR_TRIGGER_FIRE,
  payload: {
    entityId: "nodeA",
    triggerType: "pointer_enter",
  },
});

console.log(
  "TRIGGER FIRE STATE (ANIMATION):",
  runtime.getState().behaviorRuntime?.nodeA
);
console.log(
  "TRIGGER FIRE OPACITY (ANIMATION):",
  runtime.getState().nodes?.nodeA?.style?.opacity
);

console.log(
  "ANIMATION MODE STATE:",
  runtime.getState().behaviorRuntime?.nodeA
);
console.log(
  "ANIMATION MODE OPACITY:",
  runtime.getState().nodes?.nodeA?.style?.opacity
);

console.log("\n--- MULTI COMMIT TEST ---");

await runtime.dispatch({
  type: EventTypes.BEHAVIOR_STATE_COMMIT,
  payload: { entityId: "nodeA", targetStateId: "idle" },
});

await runtime.dispatch({
  type: EventTypes.BEHAVIOR_STATE_COMMIT,
  payload: { entityId: "nodeA", targetStateId: "hover" },
});

console.log("CURRENT:", runtime.getState().behaviorRuntime.nodeA);

runtime.undo();
console.log("UNDO 1:", runtime.getState().behaviorRuntime.nodeA);

runtime.undo();
console.log("UNDO 2:", runtime.getState().behaviorRuntime.nodeA);

runtime.redo();
console.log("REDO 1:", runtime.getState().behaviorRuntime.nodeA);

runtime.redo();
console.log("REDO 2:", runtime.getState().behaviorRuntime.nodeA);

function stableHash(obj) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(obj))
    .digest("hex");
}

console.log("\n--- REPLAY DETERMINISM TEST ---");

// Capture event list
const eventLog = [
  {
    type: EventTypes.BEHAVIOR_STATE_COMMIT,
    payload: { entityId: "nodeA", targetStateId: "hover" },
  },
  {
    type: EventTypes.BEHAVIOR_STATE_COMMIT,
    payload: { entityId: "nodeA", targetStateId: "idle" },
  },
  {
    type: EventTypes.BEHAVIOR_STATE_COMMIT,
    payload: { entityId: "nodeA", targetStateId: "hover" },
  },
];

// Dispatcher A
const dispatcherA = createEventDispatcher();
dispatcherA.hydrateRuntimeState(initialSeedState, { animate: false });

for (const evt of eventLog) {
  await dispatcherA.dispatch(evt);
}

const finalA = dispatcherA.getState();
const hashA = stableHash({
  nodes: finalA.nodes,
  behaviorRuntime: finalA.behaviorRuntime,
  behaviors: finalA.behaviors,
  timeline: finalA.timeline,
});

console.log("HASH A:", hashA);

// Dispatcher B
const dispatcherB = createEventDispatcher();
dispatcherB.hydrateRuntimeState(initialSeedState, { animate: false });

for (const evt of eventLog) {
  await dispatcherB.dispatch(evt);
}

const finalB = dispatcherB.getState();
const hashB = stableHash({
  nodes: finalB.nodes,
  behaviorRuntime: finalB.behaviorRuntime,
  behaviors: finalB.behaviors,
  timeline: finalB.timeline,
});

console.log("\n--- DIFF CHECK ---");

console.log(
  "NODES EQUAL:",
  JSON.stringify(finalA.nodes) === JSON.stringify(finalB.nodes)
);

console.log(
  "RUNTIME EQUAL:",
  JSON.stringify(finalA.behaviorRuntime) ===
    JSON.stringify(finalB.behaviorRuntime)
);

console.log(
  "BEHAVIORS EQUAL:",
  JSON.stringify(finalA.behaviors) === JSON.stringify(finalB.behaviors)
);

console.log(
  "TIMELINE EQUAL:",
  JSON.stringify(finalA.timeline) === JSON.stringify(finalB.timeline)
);

console.log("HASH B:", hashB);

console.log("DETERMINISTIC:", hashA === hashB);
