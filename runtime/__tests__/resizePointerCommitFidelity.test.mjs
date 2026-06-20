import { EventTypes } from '@/core/events/eventTypes.js';
import { __TESTING__ } from '@/runtime/input/coreToolHandlers.js';

const { resizeToolHandler } = __TESTING__;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function createRuntimeState({ handle, startPointer, currentPointer, originBounds }) {
  return {
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
        startPointer,
        currentPointer,
        previousPointer: startPointer,
        bounds: originBounds,
        resize: {
          handle,
          originBounds,
        },
      },
    },
  };
}

function runResizePointerUp({ handle, startPointer, currentPointer, finalPointer, originBounds }) {
  const dispatched = [];
  const dispatcher = {
    dispatch(event) {
      dispatched.push(event);
    },
  };

  const result = resizeToolHandler(
    {
      type: 'pointerup',
      worldPoint: finalPointer,
    },
    {
      dispatcher,
      state: createRuntimeState({ handle, startPointer, currentPointer, originBounds }),
    },
  );

  assert(result?.handled === true, `pointerup should be handled for resize handle ${handle}`);

  const layoutBulk = dispatched.find((event) => event.type === 'node.layout.bulk');
  assert(Boolean(layoutBulk), `pointerup should emit final layout bulk update for handle ${handle}`);

  const update = layoutBulk.payload?.updates?.[0] ?? null;
  assert(Boolean(update), `pointerup should include resized node update for handle ${handle}`);

  const dragEndIndex = dispatched.findIndex((event) => event.type === EventTypes.DRAG_END);
  const bulkIndex = dispatched.findIndex((event) => event.type === 'node.layout.bulk');
  assert(
    bulkIndex >= 0 && dragEndIndex >= 0 && bulkIndex < dragEndIndex,
    `final resize update must happen before drag end for handle ${handle}`,
  );

  return update;
}

const originBounds = { x: 100, y: 200, width: 120, height: 80 };

{
  const update = runResizePointerUp({
    handle: 'se',
    startPointer: { x: 220, y: 280 },
    currentPointer: { x: 235, y: 290 },
    finalPointer: { x: 250, y: 300 },
    originBounds,
  });

  assert(update.x === 100, 'se resize should keep x stable');
  assert(update.y === 200, 'se resize should keep y stable');
  assert(update.width === 150, 'se resize should commit final width from final pointer');
  assert(update.height === 100, 'se resize should commit final height from final pointer');
}

{
  const update = runResizePointerUp({
    handle: 'nw',
    startPointer: { x: 100, y: 200 },
    currentPointer: { x: 90, y: 185 },
    finalPointer: { x: 80, y: 170 },
    originBounds,
  });

  assert(update.x === 80, 'nw resize should commit final x from final pointer');
  assert(update.y === 170, 'nw resize should commit final y from final pointer');
  assert(update.width === 140, 'nw resize should commit final width from final pointer');
  assert(update.height === 110, 'nw resize should commit final height from final pointer');
}

{
  const update = runResizePointerUp({
    handle: 'ne',
    startPointer: { x: 220, y: 200 },
    currentPointer: { x: 235, y: 185 },
    finalPointer: { x: 250, y: 170 },
    originBounds,
  });

  assert(update.x === 100, 'ne resize should keep x stable');
  assert(update.y === 170, 'ne resize should commit final y from final pointer');
  assert(update.width === 150, 'ne resize should commit final width from final pointer');
  assert(update.height === 110, 'ne resize should commit final height from final pointer');
}

{
  const update = runResizePointerUp({
    handle: 'sw',
    startPointer: { x: 100, y: 280 },
    currentPointer: { x: 90, y: 290 },
    finalPointer: { x: 80, y: 300 },
    originBounds,
  });

  assert(update.x === 80, 'sw resize should commit final x from final pointer');
  assert(update.y === 200, 'sw resize should keep y stable');
  assert(update.width === 140, 'sw resize should commit final width from final pointer');
  assert(update.height === 100, 'sw resize should commit final height from final pointer');
}

console.log('RESIZE POINTERUP COMMITS FINAL POINTER: true');
