import test from 'node:test';
import assert from 'node:assert/strict';

import {
    __TESTING__,
    dispatchMoveDragStart,
    resolveNextMoveSelection,
} from '@/ui/bridges/toolHandlerRegistrationFacade.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { buildSpatialIndex } from '@/runtime/spatial/index.js';

const { moveToolHandler, resizeToolHandler, rotateToolHandler, selectToolHandler } = __TESTING__;

test('move selection adds the hit node during additive drag intent', () => {
    const nodeIds = resolveNextMoveSelection({
        additive: true,
        currentSelection: ['a'],
        hitNodeId: 'b',
    });

    assert.deepEqual(nodeIds, ['a', 'b']);
});

test('move selection keeps full existing selection when dragging a selected node', () => {
    const nodeIds = resolveNextMoveSelection({
        additive: false,
        currentSelection: ['a', 'b'],
        hitNodeId: 'b',
    });

    assert.deepEqual(nodeIds, ['a', 'b']);
});

test('move selection collapses to the hit node when clicking an unselected node', () => {
    const nodeIds = resolveNextMoveSelection({
        additive: false,
        currentSelection: ['a'],
        hitNodeId: 'b',
    });

    assert.deepEqual(nodeIds, ['b']);
});

test('select semantics can promote a node hit into a move drag session', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(event) {
            dispatched.push(event);
        },
    };

    const didStart = dispatchMoveDragStart({
        dispatcher,
        runtimeState: {
            viewNodes: {
                a: { layout: { x: 12, y: 24, width: 100, height: 60 } },
            },
            selection: { ids: [] },
        },
        worldPoint: { x: 30, y: 40 },
        hitNodeId: 'a',
        additive: false,
    });

    assert.equal(didStart, true);
    assert.equal(dispatched[0]?.type, EventTypes.SELECTION_SET);
    assert.equal(dispatched[1]?.type, EventTypes.DRAG_START);
    assert.deepEqual(dispatched[1]?.payload?.nodeIds, ['a']);
    assert.deepEqual(dispatched[1]?.payload?.origin?.a, { x: 12, y: 24 });
    assert.equal(dispatched[1]?.payload?.type, 'pending-move');
});

test('move drag startup keeps a multi-selection authoritative when dragging a selected node', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(event) {
            dispatched.push(event);
        },
    };

    const didStart = dispatchMoveDragStart({
        dispatcher,
        runtimeState: {
            viewNodes: {
                a: { layout: { x: 0, y: 0, width: 10, height: 10 } },
                b: { layout: { x: 20, y: 30, width: 40, height: 50 } },
            },
            selection: { ids: ['a', 'b'] },
        },
        worldPoint: { x: 25, y: 35 },
        hitNodeId: 'b',
        additive: false,
    });

    assert.equal(didStart, true);
    assert.equal(dispatched[0]?.type, EventTypes.SELECTION_SET);
    assert.equal(dispatched[1]?.type, EventTypes.DRAG_START);
    assert.deepEqual(dispatched[1]?.payload?.nodeIds, ['a', 'b']);
    assert.deepEqual(dispatched[1]?.payload?.group?.nodeIds, ['a', 'b']);
});

test('pending move drag does not promote before threshold', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(event) {
            dispatched.push(event);
        },
    };

    const result = moveToolHandler(
        {
            type: 'pointermove',
            event: {},
            worldPoint: { x: 11, y: 11 },
        },
        {
            tool: 'select',
            dispatcher,
            state: {
                viewNodes: {
                    a: { id: 'a', layout: { x: 0, y: 0, width: 10, height: 10 } },
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
                        meta: { snapTargets: [] },
                    },
                },
            },
        },
    );

    assert.deepEqual(result, { handled: true });
    assert.equal(dispatched.length, 0);
});

test('pending move drag promotes to move after threshold', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(event) {
            dispatched.push(event);
        },
    };

    const result = moveToolHandler(
        {
            type: 'pointermove',
            event: {},
            worldPoint: { x: 15, y: 10 },
        },
        {
            tool: 'select',
            dispatcher,
            state: {
                viewNodes: {
                    a: { id: 'a', layout: { x: 0, y: 0, width: 10, height: 10 } },
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
                        meta: { snapTargets: [] },
                        group: null,
                    },
                },
            },
        },
    );

    assert.deepEqual(result, { handled: true });
    assert.equal(dispatched.length, 3);
    assert.equal(dispatched[0]?.type, EventTypes.DRAG_START);
    assert.equal(dispatched[0]?.payload?.type, 'move');
    assert.equal(dispatched[1]?.type, EventTypes.DRAG_UPDATE);
    assert.equal(dispatched[2]?.type, 'node.layout.bulk');
    assert.equal(dispatched[2]?.payload?.updates?.[0]?.id, 'a');
    assert.equal(dispatched[2]?.payload?.updates?.[0]?.y, 0);
    assert.ok(dispatched[2]?.payload?.updates?.[0]?.x > 0);
});

test('pending move drag ends cleanly on pointerup without movement', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(event) {
            dispatched.push(event);
        },
    };

    const result = moveToolHandler(
        {
            type: 'pointerup',
            event: {},
            worldPoint: { x: 10, y: 10 },
        },
        {
            tool: 'select',
            dispatcher,
            state: {
                interaction: {
                    drag: {
                        active: true,
                        type: 'pending-move',
                        nodeIds: ['a'],
                        startPointer: { x: 10, y: 10 },
                    },
                },
            },
        },
    );

    assert.deepEqual(result, { handled: true });
    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.DRAG_END);
});

test('select tool shift-click defers toggle until pointerup', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(event) {
            dispatched.push(event);
        },
    };

    const result = selectToolHandler(
        {
            type: 'pointerdown',
            event: { shiftKey: true },
            worldPoint: { x: 10, y: 10 },
            targetNodeId: 'a',
        },
        {
            tool: 'select',
            dispatcher,
            state: {
                nodes: {
                    a: { id: 'a', layout: { x: 0, y: 0, width: 10, height: 10 } },
                },
                selection: { ids: [] },
                interaction: { drag: null },
            },
        },
    );

    assert.deepEqual(result, { handled: true });
    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.DRAG_START);
    assert.equal(dispatched[0]?.payload?.type, 'pending-select');
    assert.equal(dispatched[0]?.payload?.meta?.pendingToggleId, 'a');
});

test('select tool shift-click toggles selection on pointerup when marquee threshold is not crossed', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(event) {
            dispatched.push(event);
        },
    };

    const result = selectToolHandler(
        {
            type: 'pointerup',
            event: { shiftKey: true },
            worldPoint: { x: 11, y: 11 },
        },
        {
            tool: 'select',
            dispatcher,
            state: {
                nodes: {
                    a: { id: 'a', layout: { x: 0, y: 0, width: 10, height: 10 } },
                },
                selection: { ids: [] },
                interaction: {
                    drag: {
                        active: true,
                        type: 'pending-select',
                        startPointer: { x: 10, y: 10 },
                        currentPointer: { x: 11, y: 11 },
                        meta: {
                            additive: true,
                            pendingToggleId: 'a',
                        },
                    },
                },
            },
        },
    );

    assert.deepEqual(result, { handled: true });
    assert.equal(dispatched.length, 2);
    assert.equal(dispatched[0]?.type, EventTypes.SELECTION_TOGGLE);
    assert.equal(dispatched[1]?.type, EventTypes.DRAG_END);
});

test('select tool shift-drag over a hit node promotes to additive marquee selection', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(event) {
            dispatched.push(event);
        },
    };
    const scene = {
        computed: {
            a: { x: 0, y: 0, width: 50, height: 50 },
        },
        spatialIndex: null,
    };
    scene.spatialIndex = buildSpatialIndex(scene, 64);

    const result = selectToolHandler(
        {
            type: 'pointerup',
            event: { shiftKey: true },
            worldPoint: { x: 40, y: 40 },
        },
        {
            tool: 'select',
            dispatcher,
            state: {
                nodes: {
                    a: { id: 'a', layout: { x: 0, y: 0, width: 10, height: 10 } },
                },
                document: {
                    nodes: {
                        a: {},
                    },
                },
                scene,
                selection: { ids: ['seed'] },
                interaction: {
                    drag: {
                        active: true,
                        type: 'marquee',
                        startPointer: { x: 10, y: 10 },
                        currentPointer: { x: 40, y: 40 },
                        meta: {
                            additive: true,
                            pendingToggleId: 'a',
                        },
                    },
                },
            },
        },
    );

    assert.deepEqual(result, { handled: true });
    assert.equal(dispatched.length, 2);
    assert.equal(dispatched[0]?.type, EventTypes.SELECTION_SET);
    assert.deepEqual(dispatched[0]?.payload?.ids, ['seed', 'a']);
    assert.equal(dispatched[1]?.type, EventTypes.DRAG_END);
});

test('select tool click on a node selects on pointerup when no drag threshold is crossed', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(event) {
            dispatched.push(event);
        },
    };

    const result = selectToolHandler(
        {
            type: 'pointerup',
            event: {},
            worldPoint: { x: 10, y: 10 },
        },
        {
            tool: 'select',
            dispatcher,
            state: {
                nodes: {
                    a: { id: 'a', layout: { x: 0, y: 0, width: 10, height: 10 } },
                },
                selection: { ids: [] },
                interaction: {
                    drag: {
                        active: true,
                        type: 'pending-select',
                        startPointer: { x: 10, y: 10 },
                        currentPointer: { x: 10, y: 10 },
                        meta: {
                            additive: false,
                            hitNodeId: 'a',
                        },
                    },
                },
            },
        },
    );

    assert.deepEqual(result, { handled: true });
    assert.equal(dispatched.length, 2);
    assert.equal(dispatched[0]?.type, EventTypes.SELECTION_SET);
    assert.equal(dispatched[0]?.payload?.ids?.[0], 'a');
    assert.equal(dispatched[1]?.type, EventTypes.DRAG_END);
});

test('select tool pointerdown on a grouped child normalizes pending selection to the group wrapper', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(event) {
            dispatched.push(event);
        },
    };

    const result = selectToolHandler(
        {
            type: 'pointerdown',
            event: {},
            worldPoint: { x: 10, y: 10 },
            targetNodeId: 'child-a',
        },
        {
            tool: 'select',
            dispatcher,
            state: {
                viewNodes: {
                    'group-1': {
                        id: 'group-1',
                        type: 'group',
                        parentId: null,
                        children: ['child-a', 'child-b'],
                        layout: { x: 0, y: 0, width: 100, height: 100 },
                    },
                    'child-a': {
                        id: 'child-a',
                        type: 'frame',
                        parentId: 'group-1',
                        layout: { x: 0, y: 0, width: 50, height: 50 },
                    },
                    'child-b': {
                        id: 'child-b',
                        type: 'frame',
                        parentId: 'group-1',
                        layout: { x: 50, y: 0, width: 50, height: 50 },
                    },
                },
                selection: { ids: [] },
                interaction: { drag: null },
            },
        },
    );

    assert.deepEqual(result, { handled: true });
    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.DRAG_START);
    assert.equal(dispatched[0]?.payload?.type, 'pending-select');
    assert.equal(dispatched[0]?.payload?.meta?.hitNodeId, 'group-1');
});

test('select tool pointerup reselects the group wrapper after deselect when clicking a grouped child', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(event) {
            dispatched.push(event);
        },
    };

    const result = selectToolHandler(
        {
            type: 'pointerup',
            event: {},
            worldPoint: { x: 10, y: 10 },
        },
        {
            tool: 'select',
            dispatcher,
            state: {
                viewNodes: {
                    'group-1': {
                        id: 'group-1',
                        type: 'group',
                        parentId: null,
                        children: ['child-a', 'child-b'],
                        layout: { x: 0, y: 0, width: 100, height: 100 },
                    },
                    'child-a': {
                        id: 'child-a',
                        type: 'frame',
                        parentId: 'group-1',
                        layout: { x: 0, y: 0, width: 50, height: 50 },
                    },
                    'child-b': {
                        id: 'child-b',
                        type: 'frame',
                        parentId: 'group-1',
                        layout: { x: 50, y: 0, width: 50, height: 50 },
                    },
                },
                selection: { ids: [] },
                interaction: {
                    drag: {
                        active: true,
                        type: 'pending-select',
                        startPointer: { x: 10, y: 10 },
                        currentPointer: { x: 10, y: 10 },
                        meta: {
                            additive: false,
                            hitNodeId: 'group-1',
                        },
                    },
                },
            },
        },
    );

    assert.deepEqual(result, { handled: true });
    assert.equal(dispatched.length, 2);
    assert.equal(dispatched[0]?.type, EventTypes.SELECTION_SET);
    assert.deepEqual(dispatched[0]?.payload?.ids, ['group-1']);
    assert.equal(dispatched[0]?.payload?.primary, 'group-1');
    assert.equal(dispatched[1]?.type, EventTypes.DRAG_END);
});

test('select tool drag from an unselected node resolves to marquee after threshold', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(event) {
            dispatched.push(event);
        },
    };

    const result = selectToolHandler(
        {
            type: 'pointermove',
            event: {},
            worldPoint: { x: 20, y: 20 },
        },
        {
            tool: 'select',
            dispatcher,
            state: {
                nodes: {
                    a: { id: 'a', layout: { x: 0, y: 0, width: 40, height: 40 } },
                },
                selection: { ids: [] },
                interaction: {
                    drag: {
                        active: true,
                        type: 'pending-select',
                        startPointer: { x: 10, y: 10 },
                        currentPointer: { x: 10, y: 10 },
                        meta: {
                            additive: false,
                            hitNodeId: 'a',
                            wasHitSelected: false,
                        },
                    },
                },
            },
        },
    );

    assert.deepEqual(result, { handled: true });
    assert.equal(dispatched.length, 2);
    assert.equal(dispatched[0]?.type, EventTypes.DRAG_START);
    assert.equal(dispatched[0]?.payload?.type, 'marquee');
    assert.equal(dispatched[1]?.type, EventTypes.DRAG_UPDATE);
});

test('select tool pointerup delegates active move drags to move handler and ends drag', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(event) {
            dispatched.push(event);
        },
    };

    const result = selectToolHandler(
        {
            type: 'pointerup',
            event: {},
            worldPoint: { x: 25, y: 35 },
            targetNodeId: null,
        },
        {
            tool: 'select',
            dispatcher,
            state: {
                nodes: {
                    a: { id: 'a', layout: { x: 10, y: 20, width: 30, height: 40 } },
                },
                selection: { ids: ['a'] },
                interaction: {
                    drag: {
                        active: true,
                        type: 'move',
                        nodeIds: ['a'],
                        origin: { a: { x: 10, y: 20 } },
                        currentPointer: { x: 25, y: 35 },
                        previousPointer: { x: 20, y: 30 },
                        startPointer: { x: 10, y: 20 },
                        meta: { snapTargets: [] },
                    },
                },
            },
        },
    );

    assert.deepEqual(result, { handled: true });
    assert.equal(dispatched.length, 3);
    assert.equal(dispatched[0]?.type, EventTypes.DRAG_UPDATE);
    assert.equal(dispatched[1]?.type, 'node.layout.bulk');
    assert.equal(dispatched[2]?.type, EventTypes.DRAG_END);
});

test('resize tool pointerdown starts canonical resize drag with handle metadata', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(event) {
            dispatched.push(event);
        },
    };

    const result = resizeToolHandler(
        {
            type: 'pointerdown',
            event: {},
            worldPoint: { x: 40, y: 60 },
            targetNodeId: 'a',
            resizeHandle: 'se',
        },
        {
            tool: 'resize',
            dispatcher,
            state: {
                viewNodes: {
                    a: { id: 'a', layout: { x: 10, y: 20, width: 30, height: 40 } },
                },
                interaction: { drag: null },
            },
        },
    );

    assert.deepEqual(result, { handled: true });
    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.DRAG_START);
    assert.equal(dispatched[0]?.payload?.type, 'resize');
    assert.equal(dispatched[0]?.payload?.handle, 'se');
    assert.deepEqual(dispatched[0]?.payload?.originBounds, {
        x: 10,
        y: 20,
        width: 30,
        height: 40,
    });
});

test('resize tool pointerdown accepts handle alias', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(event) {
            dispatched.push(event);
        },
    };

    const result = resizeToolHandler(
        {
            type: 'pointerdown',
            event: {},
            worldPoint: { x: 40, y: 60 },
            targetNodeId: 'a',
            handle: 'se',
        },
        {
            tool: 'resize',
            dispatcher,
            state: {
                viewNodes: {
                    a: { id: 'a', layout: { x: 10, y: 20, width: 30, height: 40 } },
                },
                interaction: { drag: null },
            },
        },
    );

    assert.deepEqual(result, { handled: true });
    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.DRAG_START);
    assert.equal(dispatched[0]?.payload?.type, 'resize');
    assert.equal(dispatched[0]?.payload?.handle, 'se');
    assert.deepEqual(dispatched[0]?.payload?.nodeIds, ['a']);
});

test('select tool pointerup delegates active resize drags to resize handler and ends drag', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(event) {
            dispatched.push(event);
        },
    };

    const result = selectToolHandler(
        {
            type: 'pointerup',
            event: {},
            worldPoint: { x: 50, y: 70 },
            targetNodeId: 'a',
        },
        {
            tool: 'select',
            dispatcher,
            state: {
                viewNodes: {
                    a: { id: 'a', layout: { x: 10, y: 20, width: 30, height: 40 } },
                },
                selection: { ids: ['a'] },
                interaction: {
                    drag: {
                        active: true,
                        type: 'resize',
                        nodeIds: ['a'],
                        startPointer: { x: 40, y: 60 },
                        currentPointer: { x: 50, y: 70 },
                        previousPointer: { x: 45, y: 65 },
                        resize: {
                            handle: 'se',
                            originBounds: { x: 10, y: 20, width: 30, height: 40 },
                        },
                    },
                },
            },
        },
    );

    assert.deepEqual(result, { handled: true });
    assert.equal(dispatched.length, 2);
    assert.equal(dispatched[0]?.type, 'node.layout.bulk');
    assert.deepEqual(dispatched[0]?.payload, {
        updates: [
            {
                id: 'a',
                x: 10,
                y: 20,
                width: 40,
                height: 50,
            },
        ],
    });
    assert.equal(dispatched[1]?.type, EventTypes.DRAG_END);
});

test('rotate tool pointerdown starts canonical rotate drag with center metadata', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(event) {
            dispatched.push(event);
        },
    };

    const result = rotateToolHandler(
        {
            type: 'pointerdown',
            event: {},
            worldPoint: { x: 25, y: 5 },
            targetNodeId: 'a',
        },
        {
            tool: 'rotate',
            dispatcher,
            state: {
                viewNodes: {
                    a: { id: 'a', layout: { x: 10, y: 20, width: 30, height: 40 }, rotation: 0 },
                },
                interaction: { drag: null },
            },
        },
    );

    assert.deepEqual(result, { handled: true });
    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.DRAG_START);
    assert.equal(dispatched[0]?.payload?.type, 'rotate');
    assert.deepEqual(dispatched[0]?.payload?.center, { x: 25, y: 40 });
    assert.equal(dispatched[0]?.payload?.originAngle, 0);
});

test('select tool pointerup delegates active rotate drags to rotate handler and ends drag', () => {
    const dispatched = [];
    const dispatcher = {
        dispatch(event) {
            dispatched.push(event);
        },
    };

    const result = selectToolHandler(
        {
            type: 'pointerup',
            event: {},
            worldPoint: { x: 30, y: 10 },
            targetNodeId: 'a',
        },
        {
            tool: 'select',
            dispatcher,
            state: {
                viewNodes: {
                    a: { id: 'a', layout: { x: 10, y: 20, width: 30, height: 40 }, rotation: 0 },
                },
                selection: { ids: ['a'] },
                interaction: {
                    drag: {
                        active: true,
                        type: 'rotate',
                        nodeIds: ['a'],
                        startPointer: { x: 25, y: 5 },
                        currentPointer: { x: 30, y: 10 },
                        previousPointer: { x: 27, y: 7 },
                        rotation: {
                            originAngle: 0,
                            center: { x: 25, y: 40 },
                        },
                    },
                },
            },
        },
    );

    assert.deepEqual(result, { handled: true });
    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.DRAG_END);
});
