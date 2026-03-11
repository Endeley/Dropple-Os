import test from 'node:test';
import assert from 'node:assert/strict';

import {
    initialRuntimeState,
    __resetRuntimeStateInternal,
    __setRuntimeStateInternal,
    __getRuntimeStateInternal,
} from '@/runtime/state/runtimeState.internal.js';

test.beforeEach(() => {
    __resetRuntimeStateInternal();
});

test('initial runtime state keeps the canonical kernel slices', () => {
    assert.ok(initialRuntimeState.document);
    assert.deepEqual(Object.keys(initialRuntimeState.document).sort(), [
        'assets',
        'components',
        'exports',
        'layout',
        'meta',
        'motion',
        'sceneGraph',
        'scenes',
    ]);
    assert.ok(initialRuntimeState.selection);
    assert.ok(initialRuntimeState.selection.ids instanceof Set);
    assert.equal(initialRuntimeState.selection.primary, null);
    assert.ok(initialRuntimeState.workspace);
    assert.equal(initialRuntimeState.__isReplaying, false);
});

test('runtime internal state accepts a canonical document envelope', () => {
    const document = structuredClone(initialRuntimeState.document);
    __setRuntimeStateInternal(
        {
            ...initialRuntimeState,
            document,
        },
        'dispatcher',
    );

    const state = __getRuntimeStateInternal();
    assert.equal(state.document.meta.id, document.meta.id);
    assert.deepEqual(state.document.sceneGraph.rootIds, []);
    assert.deepEqual(state.document.motion.clips, {});
});
