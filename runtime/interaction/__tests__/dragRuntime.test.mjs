import test from 'node:test';
import assert from 'node:assert/strict';
import { initialDragState, startDrag, updateDrag, endDrag } from '@/runtime/interaction/dragRuntime.js';

test('updateDrag falls back to startPointer when currentPointer is missing', () => {
    const started = startDrag(initialDragState, {
        type: 'move',
        nodeIds: ['a'],
        pointer: { x: 10, y: 20 },
    });

    const stateWithMissingCurrent = {
        ...started,
        currentPointer: null,
    };

    const updated = updateDrag(stateWithMissingCurrent, {
        pointer: { x: 15, y: 25 },
        guides: [],
    });

    assert.deepEqual(updated.previousPointer, { x: 10, y: 20 });
    assert.deepEqual(updated.currentPointer, { x: 15, y: 25 });
});

test('endDrag resets to initial drag state', () => {
    const started = startDrag(initialDragState, {
        type: 'move',
        nodeIds: ['a'],
        pointer: { x: 10, y: 20 },
    });

    const ended = endDrag(started);

    assert.deepEqual(ended, initialDragState);
});
