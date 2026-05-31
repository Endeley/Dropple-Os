import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { installBlueprint, certifyBlueprint } from '@/runtime/blueprints/installBlueprint.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { hashCanonicalDocument } from '@/core/persistence/hashDocument.js';

function createBlueprint() {
    return certifyBlueprint({
        id: 'bp.bootstrap.release.v1',
        version: 1,
        name: 'Bootstrap Release Blueprint',
        description: 'release-law fixture',
        kind: 'project',
        workspaceProfiles: { create: ['graphic'] },
        capabilityProfiles: { create: ['node:create'] },
        seedGraph: { nodes: {}, rootIds: [] },
        seedEvents: [
            {
                type: EventTypes.NODE_CREATE,
                payload: { node: { id: 'root.frame', type: 'frame' } },
            },
        ],
        workflowPresets: {},
        publishPresets: {},
        lineage: {
            rootId: 'bp.bootstrap.release.root',
            versionId: 'bp.bootstrap.release.v1',
            parentVersionId: null,
        },
    });
}

function createManifest() {
    return {
        schemaVersion: 1,
        projectId: 'project.bootstrap.release',
        projectName: 'Release Provenance Project',
        defaultPerspectiveId: 'create',
        blueprintId: 'bp.bootstrap.release.v1',
        blueprintVersionId: 'bp.bootstrap.release.v1',
    };
}

test('blueprint bootstrap provenance is persisted and replay-equivalent', async () => {
    const blueprint = createBlueprint();
    const manifest = createManifest();

    const left = createEventDispatcher({ headless: true });
    const right = createEventDispatcher({ headless: true });
    left.hydrateRuntimeState(initialRuntimeState, { animate: false });
    right.hydrateRuntimeState(initialRuntimeState, { animate: false });

    const leftResult = await installBlueprint({ dispatcher: left, blueprint, manifest });
    const rightResult = await installBlueprint({ dispatcher: right, blueprint, manifest });

    const leftState = left.getState();
    const rightState = right.getState();

    assert.equal(leftResult.bootstrapEvent.type, EventTypes.PROJECT_BLUEPRINT_BOOTSTRAP);
    assert.equal(leftState.document.meta.projectBootstrap.projectId, manifest.projectId);
    assert.equal(leftState.document.meta.projectBootstrap.blueprintVersionId, manifest.blueprintVersionId);
    assert.equal(leftState.events[0].type, EventTypes.PROJECT_BLUEPRINT_BOOTSTRAP);
    assert.equal(rightState.events[0].type, EventTypes.PROJECT_BLUEPRINT_BOOTSTRAP);
    assert.equal(hashCanonicalDocument(leftState.document), hashCanonicalDocument(rightState.document));
    assert.deepEqual(leftResult.bootstrapEvent.payload, rightResult.bootstrapEvent.payload);
});
