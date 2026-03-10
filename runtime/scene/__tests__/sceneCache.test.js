import test from 'node:test';
import assert from 'node:assert/strict';

import { ensureSceneCache, clearSceneCache } from '@/runtime/scene/sceneCache.js';

test('scene cache initializes deterministically', () => {
    const runtime = {};
    const scene = ensureSceneCache(runtime);

    assert.ok(scene.computed);
    assert.ok(scene.layoutRoots);
    assert.equal(scene.dependencyGraph, null);
});

test('scene cache clears correctly', () => {
    const runtime = {};
    const scene = ensureSceneCache(runtime);

    scene.computed.a = { x: 1 };

    clearSceneCache(runtime);

    assert.deepEqual(runtime.scene.computed, {});
});
