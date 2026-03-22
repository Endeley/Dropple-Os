import test from 'node:test';
import assert from 'node:assert/strict';

import {
    dispatchMoveDragStart,
    resolveNextMoveSelection,
} from '@/ui/bridges/toolHandlerRegistrationFacade.js';
import { EventTypes } from '@/core/events/eventTypes.js';

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
            nodes: {
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
    assert.equal(dispatched[1]?.payload?.type, 'move');
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
            nodes: {
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
