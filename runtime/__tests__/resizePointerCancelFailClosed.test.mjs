import { EventTypes } from '@/core/events/eventTypes.js';
import { __TESTING__ } from '@/runtime/input/coreToolHandlers.js';

const { resizeToolHandler } = __TESTING__;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const dispatched = [];
const originBounds = { x: 100, y: 200, width: 120, height: 80 };

const runtimeState = {
  document: {
    sceneGraph: {
      nodes: {
        a: {
          id: 'a',
          type: 'frame',
          parentId: null,
          children: [],
          layout: { ...originBounds },
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
      layout: { ...originBounds },
    },
  },
  interaction: {
    drag: {
      active: true,
      type: 'resize',
      nodeIds: ['a'],
      startPointer: { x: 220, y: 280 },
      currentPointer: { x: 230, y: 290 },
      previousPointer: { x: 225, y: 285 },
      bounds: originBounds,
      resize: {
        handle: 'se',
        originBounds,
      },
    },
  },
};

const dispatcher = {
  dispatch(event) {
    dispatched.push(event);
  },
};

const result = resizeToolHandler(
  {
    type: 'pointercancel',
    worldPoint: { x: 240, y: 295 },
  },
  {
    dispatcher,
    state: runtimeState,
  },
);

assert(result?.handled === true, 'pointercancel should be handled for active resize drag');

const layoutBulk = dispatched.find((event) => event.type === 'node.layout.bulk');
assert(Boolean(layoutBulk), 'pointercancel should preserve final preview bounds before closing');

const update = layoutBulk.payload?.updates?.[0] ?? null;
assert(Boolean(update), 'pointercancel should emit resized node update');
assert(update.width === 140, 'pointercancel should commit final width from final pointer');
assert(update.height === 95, 'pointercancel should commit final height from final pointer');

const dragEndEvents = dispatched.filter((event) => event.type === EventTypes.DRAG_END);
assert(dragEndEvents.length === 1, 'pointercancel should emit exactly one drag-end event');

console.log('RESIZE POINTERCANCEL FAIL-CLOSED: true');
