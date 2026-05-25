import { EventTypes } from '@/core/events/eventTypes.js';
import { __TESTING__ } from '@/runtime/input/coreToolHandlers.js';

const { moveToolHandler } = __TESTING__;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runMoveUpdate({ shift, worldPoint }) {
  const dispatched = [];
  const dispatcher = {
    dispatch(event) {
      dispatched.push(event);
    },
  };

  const result = moveToolHandler(
    {
      type: 'pointermove',
      event: { shiftKey: shift === true },
      modifiers: { shift: shift === true },
      worldPoint,
    },
    {
      dispatcher,
      state: {
        viewNodes: {
          a: { id: 'a', layout: { x: 0, y: 0, width: 10, height: 10 } },
        },
        interaction: {
          drag: {
            active: true,
            type: 'move',
            nodeIds: ['a'],
            startPointer: { x: 0, y: 0 },
            currentPointer: { x: 0, y: 0 },
            previousPointer: { x: 0, y: 0 },
            origin: { a: { x: 0, y: 0 } },
            meta: { snapTargets: [] },
          },
        },
      },
    },
  );

  return { result, dispatched };
}

const locked = runMoveUpdate({ shift: true, worldPoint: { x: 24, y: 9 } });
assert(locked.result?.handled === true, 'locked move should be handled');
assert(locked.dispatched[0]?.type === EventTypes.DRAG_UPDATE, 'locked move should dispatch drag update');
assert(locked.dispatched[1]?.type === 'node.layout.bulk', 'locked move should dispatch bulk layout');
assert(locked.dispatched[1]?.payload?.updates?.[0]?.x === 24, 'locked move should preserve x delta');
assert(locked.dispatched[1]?.payload?.updates?.[0]?.y === 0, 'locked move should axis-lock y delta to zero');

const unlocked = runMoveUpdate({ shift: false, worldPoint: { x: 24, y: 9 } });
assert(unlocked.result?.handled === true, 'unlocked move should be handled');
assert(unlocked.dispatched[0]?.type === EventTypes.DRAG_UPDATE, 'unlocked move should dispatch drag update');
assert(unlocked.dispatched[1]?.type === 'node.layout.bulk', 'unlocked move should dispatch bulk layout');
assert(unlocked.dispatched[1]?.payload?.updates?.[0]?.x === 24, 'unlocked move should preserve x delta');
assert(unlocked.dispatched[1]?.payload?.updates?.[0]?.y === 9, 'unlocked move should use live y delta after shift release');

console.log('MOVE AXIS LOCK LIVE SHIFT: true');
