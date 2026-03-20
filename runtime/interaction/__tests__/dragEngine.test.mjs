import test from 'node:test';
import assert from 'node:assert/strict';
import {
    endDrag,
    initialDragState,
    startDrag,
    updateDrag,
} from '@/runtime/interaction/dragRuntime.js';
import { computeDragDelta } from '@/runtime/interaction/dragEngine.js';

test('startDrag initializes deterministic drag state', () => {
    const next = startDrag(initialDragState, {
        type: 'move',
        nodeIds: ['a'],
        pointer: { x: 10, y: 20 },
        origin: { a: { x: 1, y: 2 } },
    });

    assert.equal(next.active, true);
    assert.equal(next.type, 'move');
    assert.deepEqual(next.nodeIds, ['a']);
    assert.deepEqual(next.startPointer, { x: 10, y: 20 });
    assert.deepEqual(next.currentPointer, { x: 10, y: 20 });
    assert.deepEqual(next.origin, { a: { x: 1, y: 2 } });
});

test('updateDrag updates current pointer without mutating origin', () => {
    const started = startDrag(initialDragState, {
        type: 'move',
        nodeIds: ['a'],
        pointer: { x: 10, y: 20 },
        origin: { a: { x: 1, y: 2 } },
    });

    const next = updateDrag(started, { x: 25, y: 35 });

    assert.deepEqual(next.currentPointer, { x: 25, y: 35 });
    assert.deepEqual(next.origin, { a: { x: 1, y: 2 } });
});

test('endDrag returns initial drag state', () => {
    assert.deepEqual(endDrag(), initialDragState);
});

test('computeDragDelta resolves pointer delta deterministically', () => {
    const delta = computeDragDelta({
        startPointer: { x: 10, y: 15 },
        currentPointer: { x: 16, y: 25 },
    });

    assert.deepEqual(delta, { dx: 6, dy: 10 });
});

test('computeDragDelta snaps to grid before apply when enabled', () => {
    const delta = computeDragDelta(
        {
            startPointer: { x: 10, y: 15 },
            currentPointer: { x: 16, y: 27 },
        },
        {
            snap: true,
            snapOptions: { grid: 10 },
        },
    );

    assert.deepEqual(delta, { dx: 10, dy: 10 });
});
