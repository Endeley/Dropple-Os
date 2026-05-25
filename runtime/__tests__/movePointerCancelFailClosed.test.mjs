import { EventTypes } from '@/core/events/eventTypes.js';
import { __TESTING__ } from '@/runtime/input/coreToolHandlers.js';

const { moveToolHandler } = __TESTING__;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const dispatched = [];
const runtimeState = {
  document: {
    sceneGraph: {
      nodes: {
        a: { id: 'a', type: 'frame', parentId: null, children: [], layout: { x: 0, y: 0, width: 100, height: 80 } },
      },
    },
  },
  viewNodes: {
    a: { id: 'a', type: 'frame', parentId: null, children: [], layout: { x: 0, y: 0, width: 100, height: 80 } },
  },
  interaction: {
    drag: {
      active: true,
      type: 'pending-move',
      nodeIds: ['a'],
      startPointer: { x: 10, y: 10 },
      currentPointer: { x: 10, y: 10 },
      previousPointer: { x: 10, y: 10 },
      origin: { a: { x: 0, y: 0 } },
      meta: { snapTargets: [], duplicateRequested: true },
      group: null,
    },
  },
};

const dispatcher = {
  dispatch(event) {
    dispatched.push(event);
  },
};

const result = moveToolHandler(
  {
    type: 'pointercancel',
    event: { altKey: true, shiftKey: true },
    modifiers: { alt: true, shift: true },
    worldPoint: { x: 12, y: 11 },
  },
  {
    dispatcher,
    state: runtimeState,
  },
);

assert(result?.handled === true, 'pointercancel should be handled for pending move drag');
assert(dispatched.length === 1, 'pointercancel should emit a single drag-end event');
assert(dispatched[0]?.type === EventTypes.DRAG_END, 'pointercancel should end drag session');
assert(
  dispatched.every((event) => event.type !== EventTypes.NODE_CREATE),
  'pointercancel before threshold must not commit duplicate node creation',
);

console.log('MOVE POINTERCANCEL FAIL-CLOSED: true');
