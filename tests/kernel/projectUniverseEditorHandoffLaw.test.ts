import test from 'node:test';
import assert from 'node:assert/strict';

import { ArtifactKind } from '@/core/artifacts/ArtifactKind.js';
import {
    resolveProjectUniverseContinuityTarget,
    resolveProjectUniverseEditorHandoff,
} from '@/runtime/workspaces/projectUniverseEditorHandoff.js';

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

test('project universe continuity target resolves deterministic artifact anchors for nodes and groups', () => {
    const universe = Object.freeze({
        hubId: 'hub',
        nodes: Object.freeze({
            hub: Object.freeze({ id: 'hub', kind: ArtifactKind.PROJECT_HUB, label: 'Hub' }),
            'document:primary': Object.freeze({
                id: 'document:primary',
                kind: ArtifactKind.DOCUMENT,
                label: 'Document',
            }),
        }),
        groups: Object.freeze({
            'group:create': Object.freeze({
                id: 'group:create',
                perspectiveId: 'create',
                label: 'Create',
                nodeIds: Object.freeze(['document:primary']),
                metadata: Object.freeze({
                    primaryNodeId: 'document:primary',
                }),
            }),
        }),
    });

    assert.deepEqual(
        resolveProjectUniverseContinuityTarget({
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
        resolveProjectUniverseContinuityTarget({
            universe,
            targetId: 'group:create',
            currentPerspectiveId: 'overview',
            currentEntryId: 'uiux',
        }),
        Object.freeze({
            targetId: 'group:create',
            perspectiveId: 'create',
            entryId: 'document',
            label: 'Create',
            kind: ArtifactKind.DOCUMENT,
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
