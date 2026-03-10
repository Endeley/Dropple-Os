import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildSpatialIndex,
    queryPoint,
    queryBounds,
} from '@/runtime/spatial/index.js';

test('uniform grid spatial index is deterministic', () => {
    const runtimeScene = {
        computed: {
            a: { x: 0, y: 0, width: 50, height: 50 },
            b: { x: 200, y: 100, width: 80, height: 40 },
            c: { x: 120, y: 120, width: 30, height: 30 },
        },
    };

    const indexA = buildSpatialIndex(runtimeScene, 64);
    const indexB = buildSpatialIndex(runtimeScene, 64);

    assert.deepEqual(
        [...indexA.cells.keys()].sort(),
        [...indexB.cells.keys()].sort(),
    );

    assert.deepEqual(queryPoint(indexA, 10, 10), ['a']);
    assert.deepEqual(queryPoint(indexA, 210, 110), ['b']);
    assert.deepEqual(
        queryBounds(indexA, { x: 100, y: 100, width: 150, height: 80 }).sort(),
        ['b', 'c'],
    );
});
