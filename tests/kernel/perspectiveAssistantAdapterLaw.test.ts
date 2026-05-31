import test from 'node:test';
import assert from 'node:assert/strict';

import {
    getPerspectiveAssistantAdapter,
    listPerspectiveAssistantAdapters,
    resolvePerspectiveAssistantAdapter,
} from '@/runtime/assistants/perspectiveAdapters.js';

test('perspective assistant adapters are deterministic and complete', () => {
    const first = listPerspectiveAssistantAdapters();
    const second = listPerspectiveAssistantAdapters();

    assert.deepEqual(first, second);
    assert.deepEqual(
        first.map((entry) => entry.perspectiveId),
        ['build', 'collaborate', 'create', 'operate', 'overview', 'publish'],
    );
});

test('perspective assistant adapter resolution is deterministic for direct perspective routes', () => {
    const left = resolvePerspectiveAssistantAdapter({
        perspectiveId: 'build',
        entryId: 'application',
    });
    const right = resolvePerspectiveAssistantAdapter({
        perspectiveId: 'build',
        entryId: 'application',
    });

    assert.deepEqual(left, right);
    assert.equal(left.id, 'adapter.build');
    assert.equal(left.perspectiveId, 'build');
    assert.equal(left.workspaceId, 'build');
    assert.equal(left.modeId, 'application');
});

test('perspective assistant adapter resolution fails closed to overview for unknown perspective', () => {
    const result = resolvePerspectiveAssistantAdapter({
        perspectiveId: 'unknown',
        entryId: 'unknown',
    });

    assert.equal(result.id, 'adapter.overview');
    assert.equal(result.perspectiveId, 'overview');
    assert.equal(result.workspaceId, 'design');
});

test('perspective assistant adapter getter is strict and fail-closed', () => {
    assert.equal(getPerspectiveAssistantAdapter('operate')?.id, 'adapter.operate');
    assert.equal(getPerspectiveAssistantAdapter('unknown'), null);
});
