import test from 'node:test';
import assert from 'node:assert/strict';

import {
    initialRuntimeState,
    __resetRuntimeStateInternal,
    __setRuntimeStateInternal,
    __getRuntimeStateInternal,
} from '@/runtime/state/runtimeState.internal.js';
import {
    CANONICAL_DOCUMENT_SLICES,
    createCanonicalDocumentEnvelope,
    withDocumentEnvelope,
} from '@/core/persistence/documentEnvelope.js';

test.beforeEach(() => {
    __resetRuntimeStateInternal();
});

test('initial runtime state keeps the canonical kernel slices', () => {
    assert.ok(initialRuntimeState.document);
    assert.deepEqual(Object.keys(initialRuntimeState.document).sort(), [...CANONICAL_DOCUMENT_SLICES].sort());
    assert.ok(initialRuntimeState.selection);
    assert.ok(initialRuntimeState.selection.ids instanceof Set);
    assert.equal(initialRuntimeState.selection.primary, null);
    assert.ok(initialRuntimeState.clipboard);
    assert.deepEqual(initialRuntimeState.clipboard, { nodes: [], rootIds: [] });
    assert.ok(initialRuntimeState.workspace);
    assert.equal(initialRuntimeState.__isReplaying, false);
});

test('runtime internal state accepts a canonical document envelope', () => {
    const document = createCanonicalDocumentEnvelope();
    __setRuntimeStateInternal(
        {
            ...initialRuntimeState,
            ...withDocumentEnvelope(document),
        },
        'dispatcher',
    );

    const state = __getRuntimeStateInternal();
    assert.equal(state.document.meta.id, document.meta.id);
    assert.deepEqual(state.document.sceneGraph.rootIds, []);
    assert.deepEqual(state.document.motion.clips, {});
    assert.deepEqual(state.document.app.screens, {});
    assert.equal(state.document.app.currentScreen, null);
    assert.deepEqual(state.document.variables, {});
    assert.deepEqual(state.document.bindings, {});
});
