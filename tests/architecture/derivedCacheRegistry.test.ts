import test from 'node:test';
import assert from 'node:assert/strict';

import {
    derivedCacheRegistry,
    getDerivedCacheDescriptor,
    assertDerivedCacheDescriptor,
} from '@/runtime/derivedCacheRegistry.js';
import { ensureSceneCache } from '@/runtime/scene/sceneCache.js';

test('derived cache registry marks scene caches as non-persisted derived state', () => {
    assert.equal(derivedCacheRegistry.scene.spatialIndex.persisted, false);
    assert.deepEqual(derivedCacheRegistry.scene.layoutRoots.source, [
        'document.sceneGraph',
        'document.layout',
    ]);
    assert.deepEqual(getDerivedCacheDescriptor('scene', 'evaluationOrder'), {
        source: ['document.sceneGraph', 'runtime.scene.dependencyGraph'],
        persisted: false,
    });
});

test('derived cache registry assertions reject unknown or persisted descriptors', () => {
    assert.deepEqual(assertDerivedCacheDescriptor('scene', 'spatialIndex'), {
        source: ['document.sceneGraph', 'runtime.scene.computed'],
        persisted: false,
    });

    assert.throws(
        () => assertDerivedCacheDescriptor('scene', 'missingCache'),
        /Unknown derived cache descriptor: scene\.missingCache/,
    );
});

test('scene cache derived structures are registered explicitly', () => {
    const runtime = {};
    const scene = ensureSceneCache(runtime);
    const registered = Object.keys(derivedCacheRegistry.scene).sort();

    const sceneDerivedKeys = [
        'computed',
        'layoutRoots',
        'dependencyGraph',
        'segments',
        'nodeToSegment',
        'segmentGraph',
        'evaluationOrder',
        'evaluationLayers',
        'spatialIndex',
        'partitions',
        'nodeToPartition',
    ].sort();

    for (const key of sceneDerivedKeys) {
        assert.ok(Object.prototype.hasOwnProperty.call(scene, key), `scene cache missing expected key ${key}`);
        assert.ok(Object.prototype.hasOwnProperty.call(derivedCacheRegistry.scene, key), `derived cache registry missing scene.${key}`);
        assert.equal(assertDerivedCacheDescriptor('scene', key).persisted, false);
    }

    assert.deepEqual(registered, sceneDerivedKeys);
});
