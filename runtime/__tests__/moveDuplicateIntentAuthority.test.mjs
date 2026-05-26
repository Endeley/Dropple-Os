import { EventTypes } from '@/core/events/eventTypes.js';
import { __TESTING__ } from '@/runtime/input/coreToolHandlers.js';

const { moveToolHandler } = __TESTING__;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runPendingMovePromotion({ duplicateRequested, altOnPromotion }) {
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
            layout: { x: 0, y: 0, width: 120, height: 80 },
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
        layout: { x: 0, y: 0, width: 120, height: 80 },
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
        origin: { a: { x: 0, y: 0 } },
        meta: { snapTargets: [], duplicateRequested },
        group: null,
      },
    },
  };

  const dispatcher = {
    dispatch(event) {
      dispatched.push(event);
      if (event?.type === EventTypes.NODE_CREATE && event?.payload?.node?.id) {
        const node = event.payload.node;
        runtimeState.document.sceneGraph.nodes[node.id] = node;
        runtimeState.viewNodes[node.id] = node;
      }
    },
    getState() {
      return runtimeState;
    },
  };

  const result = moveToolHandler(
    {
      type: 'pointermove',
      worldPoint: { x: 24, y: 9 },
      event: {
        altKey: altOnPromotion === true,
        shiftKey: false,
      },
      modifiers: {
        alt: altOnPromotion === true,
        shift: false,
      },
    },
    {
      dispatcher,
      state: runtimeState,
    },
  );

  return { result, dispatched };
}

const dragStartRequestedButAltDropped = runPendingMovePromotion({
  duplicateRequested: true,
  altOnPromotion: false,
});
assert(
  dragStartRequestedButAltDropped.result?.handled === true,
  'promotion should be handled when duplicate was requested at drag start',
);
assert(
  dragStartRequestedButAltDropped.dispatched.some((event) => event.type === EventTypes.NODE_CREATE),
  'drag-start duplicate intent must still duplicate even if live alt signal is absent at promotion',
);

const dragStartNotRequestedButAltPressedLater = runPendingMovePromotion({
  duplicateRequested: false,
  altOnPromotion: true,
});
assert(
  dragStartNotRequestedButAltPressedLater.result?.handled === true,
  'promotion should be handled when duplicate was not requested at drag start',
);
assert(
  dragStartNotRequestedButAltPressedLater.dispatched.every((event) => event.type !== EventTypes.NODE_CREATE),
  'late alt press must not retroactively duplicate when drag-start intent was not requested',
);

console.log('MOVE DUPLICATE INTENT AUTHORITY: true');
