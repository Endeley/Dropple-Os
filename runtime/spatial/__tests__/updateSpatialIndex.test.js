import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createSpatialIndex,
    insertNodeIntoIndex,
    queryPoint,
    updateSpatialIndex,
} from '@/runtime/spatial/index.js';

test('incremental spatial update moves a node between buckets', () => {
    const scene = {
        computed: {
            a: {
                worldBounds: { x: 0, y: 0, width: 20, height: 20 },
            },
        },
        spatialIndex: createSpatialIndex(64),
    };

    insertNodeIntoIndex(scene.spatialIndex, 'a', scene.computed.a.worldBounds);

    assert.deepEqual(queryPoint(scene.spatialIndex, 10, 10), ['a']);
    assert.deepEqual(queryPoint(scene.spatialIndex, 100, 10), []);

    scene.computed.a = {
        worldBounds: { x: 96, y: 0, width: 20, height: 20 },
    };

    updateSpatialIndex(scene, ['a']);

    assert.deepEqual(queryPoint(scene.spatialIndex, 10, 10), []);
    assert.deepEqual(queryPoint(scene.spatialIndex, 100, 10), ['a']);
});

test('incremental spatial update removes deleted nodes from the index', () => {
    const scene = {
        computed: {
            a: {
                worldBounds: { x: 0, y: 0, width: 20, height: 20 },
            },
        },
        spatialIndex: createSpatialIndex(64),
    };

    insertNodeIntoIndex(scene.spatialIndex, 'a', scene.computed.a.worldBounds);

    delete scene.computed.a;
    updateSpatialIndex(scene, ['a']);

    assert.deepEqual(queryPoint(scene.spatialIndex, 10, 10), []);
    assert.equal(scene.spatialIndex.nodeCells.has('a'), false);
    assert.equal(scene.spatialIndex.nodeBounds.has('a'), false);
});
