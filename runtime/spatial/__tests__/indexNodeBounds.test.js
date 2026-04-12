import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createSpatialIndex,
    indexComputedNodeBounds,
    normalizeSpatialBounds,
    queryPoint,
    resolveSpatialBoundsFromComputed,
} from '@/runtime/spatial/index.js';

test('normalizeSpatialBounds clamps negative extents deterministically', () => {
    assert.deepEqual(
        normalizeSpatialBounds({ x: 10, y: 20, width: -5, height: -1 }),
        { x: 10, y: 20, width: 0, height: 0 },
    );
});

test('resolveSpatialBoundsFromComputed prefers worldBounds and falls back to computed frame fields', () => {
    assert.deepEqual(
        resolveSpatialBoundsFromComputed({
            worldBounds: { x: 50, y: 60, width: 70, height: 80 },
            x: 1,
            y: 2,
            width: 3,
            height: 4,
        }),
        { x: 50, y: 60, width: 70, height: 80 },
    );

    assert.deepEqual(
        resolveSpatialBoundsFromComputed({
            x: 5,
            y: 6,
            width: 7,
            height: 8,
        }),
        { x: 5, y: 6, width: 7, height: 8 },
    );
});

test('indexComputedNodeBounds inserts normalized computed bounds into the spatial index', () => {
    const index = createSpatialIndex(64);

    indexComputedNodeBounds(index, 'node-a', {
        worldBounds: { x: 32, y: 48, width: 20, height: 10 },
    });

    assert.deepEqual(queryPoint(index, 40, 50), ['node-a']);
});
