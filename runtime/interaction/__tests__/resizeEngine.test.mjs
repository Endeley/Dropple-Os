import test from 'node:test';
import assert from 'node:assert/strict';
import { computeResizeDelta } from '@/runtime/interaction/resizeEngine.js';

test('computeResizeDelta expands east correctly', () => {
    const result = computeResizeDelta(
        {
            resize: {
                handle: 'e',
                originBounds: { x: 10, y: 10, width: 20, height: 20 },
            },
        },
        { dx: 10, dy: 0 },
    );

    assert.deepEqual(result, {
        x: 10,
        y: 10,
        width: 30,
        height: 20,
    });
});

test('computeResizeDelta flips correctly when dragged past the west edge', () => {
    const result = computeResizeDelta(
        {
            resize: {
                handle: 'w',
                originBounds: { x: 10, y: 10, width: 20, height: 20 },
            },
        },
        { dx: 30, dy: 0 },
    );

    assert.deepEqual(result, {
        x: 30,
        y: 10,
        width: 10,
        height: 20,
    });
});
