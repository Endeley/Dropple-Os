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
  payload: { node: { id: 'b', type: 'frame' } },
});
await dispatcher.dispatch({
  type: EventTypes.NODE_CREATE,
  payload: { node: { id: 'other', type: 'frame' } },
});
await dispatcher.dispatch({
  type: EventTypes.NODE_ATTACH,
  payload: { parentId: 'root', childIds: ['a'] },
});
await dispatcher.dispatch({
  type: EventTypes.NODE_ATTACH,
  payload: { parentId: 'other', childIds: ['b'] },
});

await dispatcher.dispatch({
  type: EventTypes.NODE_WRAP,
  payload: {
    nodeIds: ['a', 'b'],
    wrapperNode: { id: 'group_1', type: 'group' },
  },
});

const blocked = dispatcher.getState();
assert(!blocked.nodes.group_1, 'wrap guard should reject nodes from different parents');
console.log('WRAP GUARD DIFFERENT PARENTS BLOCKED: true');
