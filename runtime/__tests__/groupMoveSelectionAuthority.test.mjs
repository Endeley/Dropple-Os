import { EventTypes } from '@/core/events/eventTypes.js';
import { __TESTING__ } from '@/runtime/input/coreToolHandlers.js';

const { dispatchMoveDragStart, moveToolHandler } = __TESTING__;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function createGroupRuntimeState() {
  return {
    document: {
      sceneGraph: {
        nodes: {
          'group-1': {
            id: 'group-1',
            type: 'group',
            parentId: null,
            children: ['a', 'b'],
            zIndex: 3,
            layout: { x: 100, y: 100, width: 180, height: 80 },
          },
          a: {
            id: 'a',
            type: 'frame',
            parentId: 'group-1',
            children: [],
            zIndex: 1,
            layout: { x: 100, y: 100, width: 80, height: 80 },
          },
          b: {
            id: 'b',
            type: 'frame',
            parentId: 'group-1',
            children: [],
            zIndex: 2,
            layout: { x: 200, y: 100, width: 80, height: 80 },
          },
        },
      },
    },
    viewNodes: {
      'group-1': {
        id: 'group-1',
        type: 'group',
        parentId: null,
        children: ['a', 'b'],
        zIndex: 3,
        layout: { x: 100, y: 100, width: 180, height: 80 },
      },
      a: {
        id: 'a',
        type: 'frame',
        parentId: 'group-1',
        children: [],
        zIndex: 1,
        layout: { x: 100, y: 100, width: 80, height: 80 },
      },
      b: {
        id: 'b',
        type: 'frame',
        parentId: 'group-1',
        children: [],
        zIndex: 2,
        layout: { x: 200, y: 100, width: 80, height: 80 },
      },
    },
    selection: {
      ids: new Set(['group-1']),
      primary: 'group-1',
    },
    scene: {
      computed: {
        'group-1': {
          x: 100,
          y: 100,
          width: 180,
          height: 80,
          zIndex: 3,
        },
        a: {
          x: 100,
          y: 100,
          width: 80,
          height: 80,
          zIndex: 1,
        },
        b: {
          x: 200,
          y: 100,
          width: 80,
          height: 80,
          zIndex: 2,
        },
      },
    },
  };
}

{
  const dispatched = [];
  const runtimeState = createGroupRuntimeState();
  const dispatcher = {
    dispatch(event) {
      dispatched.push(event);
    },
  };

  const handled = dispatchMoveDragStart({
    dispatcher,
    runtimeState,
    worldPoint: { x: 120, y: 120 },
    hitNodeId: 'group-1',
  });

  assert(handled === true, 'group drag start should be handled');

  const selectionSet = dispatched.find((event) => event.type === EventTypes.SELECTION_SET);
  assert(Boolean(selectionSet), 'group drag start should set selection');
  assert(selectionSet.payload.ids.length === 1 && selectionSet.payload.ids[0] === 'group-1', 'selection should remain on the group wrapper');

  const dragStart = dispatched.find((event) => event.type === EventTypes.DRAG_START);
  assert(Boolean(dragStart), 'group drag start should emit drag start');
  assert(
    JSON.stringify(dragStart.payload.nodeIds) === JSON.stringify(['group-1', 'a', 'b']),
    'group drag should move wrapper and descendants together',
  );
  assert(Boolean(dragStart.payload.group?.members?.a), 'group drag should include member metadata');
}

{
  const dispatched = [];
  const runtimeState = createGroupRuntimeState();
  runtimeState.interaction = {
    drag: {
      active: true,
      type: 'move',
      nodeIds: ['group-1', 'a', 'b'],
      startPointer: { x: 120, y: 120 },
      previousPointer: { x: 120, y: 120 },
      currentPointer: { x: 120, y: 120 },
      origin: {
        'group-1': { x: 100, y: 100 },
        a: { x: 100, y: 100 },
        b: { x: 200, y: 100 },
      },
      group: {
        active: true,
        nodeIds: ['group-1', 'a', 'b'],
        bounds: { x: 100, y: 100, width: 180, height: 80, center: { x: 190, y: 140 } },
        members: {
          'group-1': {
            originBounds: { x: 100, y: 100, width: 180, height: 80 },
            offsetFromGroupOrigin: { x: 0, y: 0 },
          },
          a: {
            originBounds: { x: 100, y: 100, width: 80, height: 80 },
            offsetFromGroupOrigin: { x: 0, y: 0 },
          },
          b: {
            originBounds: { x: 200, y: 100, width: 80, height: 80 },
            offsetFromGroupOrigin: { x: 100, y: 0 },
          },
        },
      },
      meta: { snapTargets: [] },
    },
  };

  const dispatcher = {
    dispatch(event) {
      dispatched.push(event);
    },
  };

  const result = moveToolHandler(
    {
      type: 'pointermove',
      worldPoint: { x: 150, y: 135 },
      event: { shiftKey: false },
      modifiers: { shift: false },
    },
    {
      dispatcher,
      state: runtimeState,
    },
  );

  assert(result?.handled === true, 'group move should be handled');

  const layoutBulk = dispatched.find((event) => event.type === 'node.layout.bulk');
  assert(Boolean(layoutBulk), 'group move should emit layout bulk updates');

  const byId = Object.fromEntries((layoutBulk.payload?.updates ?? []).map((update) => [update.id, update]));
  assert(byId['group-1']?.x === 130 && byId['group-1']?.y === 115, 'group wrapper should move by drag delta');
  assert(byId.a?.x === 130 && byId.a?.y === 115, 'first child should move with group');
  assert(byId.b?.x === 230 && byId.b?.y === 115, 'second child should preserve group offset while moving');
}

console.log('GROUP MOVE SELECTION AUTHORITY: true');
