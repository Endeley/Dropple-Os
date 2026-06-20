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
          layout: { x: -577, y: -52, width: 701, height: 907 },
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
      layout: { x: -577, y: -52, width: 701, height: 907 },
    },
  },
  scene: {
    computed: {
      a: {
        worldBounds: { x: -120, y: 180, width: 701, height: 907 },
      },
    },
  },
  interaction: {
    drag: {
      active: true,
      type: 'pending-move',
      nodeIds: ['a'],
      startPointer: { x: 0, y: 0 },
      currentPointer: { x: 0, y: 0 },
      previousPointer: { x: 0, y: 0 },
      origin: { a: { x: -577, y: -52 } },
      meta: { snapTargets: [], duplicateRequested: false },
      group: null,
    },
  },
};

const dispatcher = {
  dispatch(event) {
    dispatched.push(event);
  },
  getState() {
    return runtimeState;
  },
};

const result = moveToolHandler(
  {
    type: 'pointermove',
    worldPoint: { x: 20, y: 10 },
    event: {
      altKey: false,
      shiftKey: false,
    },
    modifiers: {
      alt: false,
      shift: false,
    },
  },
  {
    dispatcher,
    state: runtimeState,
  },
);

assert(result?.handled === true, 'pending move promotion should be handled');

const layoutBulk = dispatched.find((event) => event.type === 'node.layout.bulk');
assert(Boolean(layoutBulk), 'promotion should emit layout bulk update');

const update = layoutBulk.payload?.updates?.[0] ?? null;
assert(Boolean(update), 'promotion should contain moved node update');
assert(update.x === -557, 'move update should start from authored layout x, not computed worldBounds x');
assert(update.y === -42, 'move update should start from authored layout y, not computed worldBounds y');

assert(
  dispatched.some((event) => event.type === EventTypes.DRAG_START),
  'promotion should still emit drag start',
);

console.log('MOVE DRAG USES AUTHORED LAYOUT ORIGIN: true');
