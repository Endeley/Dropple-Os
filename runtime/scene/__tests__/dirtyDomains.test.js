import test from 'node:test';
import assert from 'node:assert/strict';

import { ensureSceneCache } from '@/runtime/scene/sceneCache.js';
import { computeDirtyDomains } from '@/runtime/scene/computeDirtyNodes.js';

test('move marks transform dirty only', () => {
    const runtime = {};
    ensureSceneCache(runtime);

    computeDirtyDomains({
        event: { type: 'node/transform', payload: { nodeId: 'a' } },
        runtime,
    });

    assert.deepEqual([...runtime.scene.transformDirty], ['a']);
    assert.equal(runtime.scene.layoutDirty.size, 0);
    assert.equal(runtime.scene.paintDirty.size, 0);
    assert.equal(runtime.scene.indexDirty.size, 0);
});

test('style update marks paint dirty only', () => {
    const runtime = {};
    ensureSceneCache(runtime);

    computeDirtyDomains({
        event: { type: 'node/style-update', payload: { nodeId: 'a' } },
        runtime,
    });

    assert.deepEqual([...runtime.scene.paintDirty], ['a']);
    assert.equal(runtime.scene.transformDirty.size, 0);
    assert.equal(runtime.scene.layoutDirty.size, 0);
});

test('attach marks layout parent and moved children transform dirty', () => {
    const runtime = {};
    ensureSceneCache(runtime);

    computeDirtyDomains({
        event: { type: 'node/attach', payload: { parentId: 'root', childIds: ['a', 'b'] } },
        runtime,
    });

    assert.deepEqual([...runtime.scene.layoutDirty], ['root']);
    assert.deepEqual([...runtime.scene.transformDirty].sort(), ['a', 'b']);
});
