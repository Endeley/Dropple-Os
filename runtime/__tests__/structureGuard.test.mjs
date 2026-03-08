import { EventTypes } from '@/core/events/eventTypes.js';
import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const dispatcher = createEventDispatcher({ headless: true });
dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });
await dispatcher.dispatch({
  type: EventTypes.WORKSPACE_SET_ACTIVE,
  payload: {
    id: 'graphic',
    workspaceDef: {
      id: 'graphic',
      policy: {
        capabilities: ['node:create', 'node:mutate', 'node:delete'],
      },
      timeline: null,
    },
  },
});

await dispatcher.dispatch({
  type: EventTypes.NODE_CREATE,
  payload: { node: { id: 'root', type: 'frame' } },
});

await dispatcher.dispatch({
  type: EventTypes.NODE_CREATE,
  payload: { node: { id: 'a', type: 'frame' } },
});

await dispatcher.dispatch({
  type: EventTypes.NODE_CREATE,
  payload: { node: { id: 'b', type: 'text' } },
});

await dispatcher.dispatch({
  type: EventTypes.NODE_ATTACH,
  payload: { parentId: 'root', childId: 'a' },
});

await dispatcher.dispatch({
  type: EventTypes.NODE_ATTACH,
  payload: { parentId: 'a', childId: 'b' },
});

await dispatcher.dispatch({
  type: EventTypes.NODE_REPARENT,
  payload: { nodeId: 'a', parentId: 'b', index: 0 },
});
const cycleAttempt = dispatcher.getState();

assert(cycleAttempt.nodes.a.parentId === 'root', 'structure guard should block reparent cycle');
console.log('STRUCTURE GUARD CYCLE BLOCKED: true');

await dispatcher.dispatch({
  type: EventTypes.NODE_DETACH,
  payload: { nodeId: 'root' },
});
const invalidDetach = dispatcher.getState();

assert(Array.isArray(invalidDetach.rootIds) && invalidDetach.rootIds.includes('root'), 'structure guard should block detaching a root node');
console.log('STRUCTURE GUARD ROOT DETACH BLOCKED: true');

await dispatcher.dispatch({
  type: EventTypes.NODE_REPARENT,
  payload: { nodeId: 'b', parentId: 'root', index: 1 },
});
const validReparent = dispatcher.getState();

assert(validReparent.nodes.root.children.includes('b'), 'structure guard should allow valid reparent');
assert(validReparent.nodes.b.parentId === 'root', 'valid reparent should update parent');
console.log('STRUCTURE GUARD VALID REPARENT: true');
