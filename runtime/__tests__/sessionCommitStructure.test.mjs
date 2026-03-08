import { EventTypes } from '@/core/events/eventTypes.js';
import { createSessionCommitActions } from '@/runtime/input/sessionCommitRuntimeBridge.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const actions = createSessionCommitActions({
  event: {
    payload: {
      type: 'reparent',
      nodeIds: ['a', 'b'],
      from: 'old-parent',
      to: 'new-parent',
      index: 1,
    },
  },
  context: {
    nodesById: {},
  },
});

assert(actions.dispatchEvents.length === 1, 'reparent should emit one structural event');
assert(actions.dispatchEvents[0].type === EventTypes.NODE_REPARENT, 'reparent should emit node.reparent');
assert(actions.dispatchEvents[0].payload.parentId === 'new-parent', 'reparent should target new parent');
assert(actions.dispatchEvents[0].payload.nodeIds.join(',') === 'a,b', 'reparent should preserve moved ids');

console.log('SESSION COMMIT REPARENT ATOMIC: true');
