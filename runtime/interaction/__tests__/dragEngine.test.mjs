import test from 'node:test';
import assert from 'node:assert/strict';
import {
    endDrag,
    initialDragState,
    startDrag,
    updateDrag,
} from '@/runtime/interaction/dragRuntime.js';
import { computeDragDelta } from '@/runtime/interaction/dragEngine.js';
import { resolveSnap } from '@/runtime/interaction/snapResolver.js';

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
    assert.equal(next.meta, null);
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

    assert.deepEqual(delta, { dx: 6, dy: 10, guides: [] });
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

    assert.deepEqual(delta, { dx: 10, dy: 10, guides: [] });
});

test('computeDragDelta axis-locks to the dominant direction when enabled', () => {
    const delta = computeDragDelta(
        {
            startPointer: { x: 10, y: 15 },
            currentPointer: { x: 30, y: 22 },
        },
        {
            axisLock: true,
        },
    );

    assert.deepEqual(delta, { dx: 20, dy: 0, guides: [] });
});

test('computeDragDelta applies axis lock before snapping', () => {
    const delta = computeDragDelta(
        {
            startPointer: { x: 10, y: 15 },
            currentPointer: { x: 18, y: 31 },
        },
        {
            axisLock: true,
            snap: true,
            snapOptions: { grid: 10 },
        },
    );

    assert.deepEqual(delta, { dx: 0, dy: 20, guides: [] });
});

test('computeDragDelta delegates snapping to custom resolver and returns guides', () => {
    const delta = computeDragDelta(
        {
            startPointer: { x: 10, y: 10 },
            currentPointer: { x: 14, y: 17 },
        },
        {
            snapResolver({ dx, dy }) {
                return {
                    dx: dx + 1,
                    dy: dy - 2,
                    guides: [{ type: 'vertical', x: 20 }],
                };
            },
        },
    );

    assert.deepEqual(delta, {
        dx: 5,
        dy: 5,
        guides: [{ type: 'vertical', x: 20 }],
    });
});

test('resolveSnap prefers object targets over grid when weighted closer', () => {
    const result = resolveSnap(
        { dx: 7, dy: 12 },
        {
            bounds: {
                x: 10,
                y: 20,
                width: 40,
                height: 20,
            },
            threshold: 6,
            grid: 10,
            targets: [
                { axis: 'x', value: 14, source: 'node-a', weight: 1 },
                { axis: 'y', value: 35, source: 'node-b', weight: 2 },
            ],
        },
    );

    assert.deepEqual(result, {
        dx: 11,
        dy: 17,
        guides: [
            { type: 'vertical', x: 14, source: 'node-a' },
            { type: 'horizontal', y: 35, source: 'node-b' },
        ],
    });
});
