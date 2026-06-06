import test from 'node:test';
import assert from 'node:assert/strict';

import { ArtifactKind } from '@/core/artifacts/ArtifactKind.js';
import { resolveProjectUniverseEditorHandoff } from '@/runtime/workspaces/projectUniverseEditorHandoff.js';

test('project universe editor handoff resolves canonical entry routes deterministically', () => {
    const universe = Object.freeze({
        hubId: 'hub',
        nodes: Object.freeze({
            hub: Object.freeze({ id: 'hub', kind: ArtifactKind.PROJECT_HUB, label: 'Hub' }),
            'document:primary': Object.freeze({
                id: 'document:primary',
                kind: ArtifactKind.DOCUMENT,
                label: 'Document',
            }),
            'system:model': Object.freeze({
                id: 'system:model',
                kind: ArtifactKind.SYSTEM_MODEL,
                label: 'System Model',
            }),
        }),
    });

    assert.deepEqual(
        resolveProjectUniverseEditorHandoff({
            universe,
            targetId: 'document:primary',
            currentPerspectiveId: 'create',
            currentEntryId: 'uiux',
        }),
        Object.freeze({
            targetId: 'document:primary',
            perspectiveId: 'create',
            entryId: 'document',
            label: 'Document',
            kind: ArtifactKind.DOCUMENT,
        }),
    );

    assert.deepEqual(
        resolveProjectUniverseEditorHandoff({
            universe,
            targetId: 'system:model',
            currentPerspectiveId: 'overview',
            currentEntryId: 'uiux',
        }),
        Object.freeze({
            targetId: 'system:model',
            perspectiveId: 'operate',
            entryId: 'systems-engineering',
            label: 'System Model',
            kind: ArtifactKind.SYSTEM_MODEL,
        }),
    );
});

test('project universe editor handoff fails closed for hub and unknown targets', () => {
    const universe = Object.freeze({
        hubId: 'hub',
        nodes: Object.freeze({
            hub: Object.freeze({ id: 'hub', kind: ArtifactKind.PROJECT_HUB, label: 'Hub' }),
        }),
    });

    assert.equal(
        resolveProjectUniverseEditorHandoff({
            universe,
            targetId: 'hub',
            currentPerspectiveId: 'create',
            currentEntryId: 'uiux',
        }),
        null,
    );

    assert.equal(
        resolveProjectUniverseEditorHandoff({
            universe,
            targetId: 'missing',
            currentPerspectiveId: 'create',
            currentEntryId: 'uiux',
        }),
        null,
    );
});
