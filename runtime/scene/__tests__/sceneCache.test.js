import test from 'node:test';
import assert from 'node:assert/strict';

import { ensureSceneCache, clearSceneCache } from '@/runtime/scene/sceneCache.js';

test('scene cache initializes deterministically', () => {
    const runtime = {};
    const scene = ensureSceneCache(runtime);

    assert.ok(scene.computed);
    assert.ok(scene.transformDirty instanceof Set);
    assert.ok(scene.layoutDirty instanceof Set);
    assert.ok(scene.paintDirty instanceof Set);
    assert.ok(scene.indexDirty instanceof Set);
    assert.ok(scene.layoutRoots);
    assert.equal(scene.dependencyGraph, null);
    assert.equal(scene.evaluationOrder, null);
    assert.equal(scene.evaluationLayers, null);
    assert.equal(scene.partitions, null);
});

test('scene cache clears correctly', () => {
    const runtime = {};
    const scene = ensureSceneCache(runtime);

    scene.computed.a = { x: 1 };
    scene.transformDirty.add('a');
    scene.layoutDirty.add('a');
    scene.paintDirty.add('a');
    scene.indexDirty.add('a');

    clearSceneCache(runtime);

    assert.deepEqual(runtime.scene.computed, {});
    assert.equal(runtime.scene.transformDirty.size, 0);
    assert.equal(runtime.scene.layoutDirty.size, 0);
    assert.equal(runtime.scene.paintDirty.size, 0);
    assert.equal(runtime.scene.indexDirty.size, 0);
    assert.equal(runtime.scene.evaluationOrder, null);
    assert.equal(runtime.scene.evaluationLayers, null);
    assert.equal(runtime.scene.partitions, null);
});
