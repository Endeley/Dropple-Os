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
        a: {
          id: 'a',
          type: 'frame',
          parentId: null,
          children: [],
          layout: { x: 100, y: 200, width: 120, height: 80 },
        },
      },
    },
  },
  viewNodes: {
    a: {
      id: 'a',
      type: 'frame',
      parentId: null,
      children: [],
      layout: { x: 100, y: 200, width: 120, height: 80 },
    },
  },
  interaction: {
    drag: {
      active: true,
      type: 'move',
      nodeIds: ['a'],
      startPointer: { x: 10, y: 20 },
      currentPointer: { x: 30, y: 50 },
      previousPointer: { x: 20, y: 40 },
      origin: { a: { x: 100, y: 200 } },
      meta: { snapTargets: [] },
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
    type: 'pointerup',
    worldPoint: { x: 35, y: 60 },
    event: { shiftKey: false },
    modifiers: { shift: false },
  },
  {
    dispatcher,
    state: runtimeState,
  },
);

assert(result?.handled === true, 'pointerup should be handled for active move drag');

const layoutBulk = dispatched.find((event) => event.type === 'node.layout.bulk');
assert(Boolean(layoutBulk), 'pointerup should emit a final layout bulk update');

const update = layoutBulk.payload?.updates?.[0] ?? null;
assert(Boolean(update), 'pointerup should include moved node update');
assert(update.x === 125, 'pointerup should commit final x from final world pointer');
assert(update.y === 240, 'pointerup should commit final y from final world pointer');

const dragEndIndex = dispatched.findIndex((event) => event.type === EventTypes.DRAG_END);
const bulkIndex = dispatched.findIndex((event) => event.type === 'node.layout.bulk');
assert(bulkIndex >= 0 && dragEndIndex >= 0 && bulkIndex < dragEndIndex, 'final layout update must happen before drag end');

console.log('MOVE POINTERUP COMMITS FINAL POINTER: true');
