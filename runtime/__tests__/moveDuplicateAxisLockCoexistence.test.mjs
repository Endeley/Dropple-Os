import { EventTypes } from '@/core/events/eventTypes.js';
import { __TESTING__ } from '@/runtime/input/coreToolHandlers.js';

const { moveToolHandler } = __TESTING__;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runPendingMovePromotion({ alt, shift }) {
  const dispatched = [];
  const runtimeState = {
    document: {
      sceneGraph: {
        nodes: {
          a: { id: 'a', type: 'frame', parentId: null, children: [], layout: { x: 0, y: 0, width: 120, height: 80 } },
        },
      },
    },
    viewNodes: {
      a: { id: 'a', type: 'frame', parentId: null, children: [], layout: { x: 0, y: 0, width: 120, height: 80 } },
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
        meta: { snapTargets: [], duplicateRequested: true },
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
        altKey: alt === true,
        shiftKey: shift === true,
      },
      modifiers: {
        alt: alt === true,
        shift: shift === true,
      },
    },
    {
      dispatcher,
      state: runtimeState,
    },
  );

  return { result, dispatched };
}

const altAndShift = runPendingMovePromotion({ alt: true, shift: true });
assert(altAndShift.result?.handled === true, 'alt+shift promotion should be handled');
assert(
  altAndShift.dispatched.some((event) => event.type === EventTypes.NODE_CREATE),
  'alt+shift promotion should duplicate nodes before move promotion',
);
const lockedBulk = altAndShift.dispatched.find((event) => event.type === 'node.layout.bulk');
assert(Boolean(lockedBulk), 'alt+shift promotion should emit layout bulk update');
assert(lockedBulk.payload?.updates?.length === 1, 'alt+shift promotion should move one promoted node');
assert(lockedBulk.payload?.updates?.[0]?.y === 0, 'shift should axis-lock y delta while pressed');

const shiftOnly = runPendingMovePromotion({ alt: false, shift: true });
assert(shiftOnly.result?.handled === true, 'shift-only promotion should be handled');
assert(
  shiftOnly.dispatched.every((event) => event.type !== EventTypes.NODE_CREATE),
  'without live alt, promotion must not duplicate even when duplicate was requested at drag start',
);
const shiftOnlyBulk = shiftOnly.dispatched.find((event) => event.type === 'node.layout.bulk');
assert(Boolean(shiftOnlyBulk), 'shift-only promotion should emit layout bulk update');
assert(shiftOnlyBulk.payload?.updates?.[0]?.y === 0, 'shift-only move should keep axis lock');

console.log('MOVE DUPLICATE + AXIS LOCK COEXISTENCE: true');
