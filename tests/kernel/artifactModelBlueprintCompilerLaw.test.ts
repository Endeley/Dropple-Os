import test from 'node:test';
import assert from 'node:assert/strict';

import { planUIUXArtifactModel } from '@/domain/creativeBlueprint/planUIUXArtifactModel.js';
import { compileArtifactModelToBlueprintV1 } from '@/runtime/blueprints/compileArtifactModelToBlueprintV1.js';
import {
    installBlueprint,
    verifyBlueprintCertification,
} from '@/runtime/blueprints/installBlueprint.js';
import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { hashCanonicalDocument } from '@/core/persistence/hashDocument.js';

function createLandingPageBlueprintFixture() {
    return {
        world: 'Digital Product Design',
        scenario: 'landingPage',
        purpose: 'Present an AI SaaS product',
        structure: [
            { type: 'hero' },
            { type: 'features' },
            { type: 'pricing' },
            { type: 'faq' },
            { type: 'footer' },
        ],
        relationships: [
            { from: 'hero:1', to: 'features:2' },
            { from: 'features:2', to: 'pricing:3' },
        ],
    };
}

function createInstallManifest(blueprint) {
    return Object.freeze({
        schemaVersion: 1,
        projectId: 'project.artifact-model',
        projectName: 'Artifact Model Project',
        defaultPerspectiveId: 'create',
        blueprintId: blueprint.id,
        blueprintVersionId: blueprint.lineage.versionId,
    });
}

test('artifact model compiler emits deterministic BlueprintV1 from identical artifact models', () => {
    const artifactModel = planUIUXArtifactModel({ blueprint: createLandingPageBlueprintFixture() });

    const left = compileArtifactModelToBlueprintV1({ artifactModel });
    const right = compileArtifactModelToBlueprintV1({ artifactModel });

    assert.deepEqual(left, right);
    assert.equal(verifyBlueprintCertification(left), true);
    assert.deepEqual(left.seedGraph.rootIds, ['page-root']);
    assert.equal(left.seedEvents[0]?.payload?.node?.id, 'page-root');
    assert.equal(left.seedEvents[1]?.payload?.node?.parentId, 'page-root');
});

test('artifact model compiler does not plan from advisory relationships', () => {
    const artifactModel = planUIUXArtifactModel({ blueprint: createLandingPageBlueprintFixture() });
    const variant = {
        ...artifactModel,
        advisoryRelationships: Object.freeze([{ from: 'footer:5', to: 'hero:1' }]),
        relationships: Object.freeze([{ from: 'footer:5', to: 'hero:1' }]),
    };

    const left = compileArtifactModelToBlueprintV1({ artifactModel });
    const right = compileArtifactModelToBlueprintV1({ artifactModel: variant });

    assert.deepEqual(left, right);
});

test('artifact model compiler emits BlueprintV1 contract shape', () => {
    const artifactModel = planUIUXArtifactModel({ blueprint: createLandingPageBlueprintFixture() });
    const compiled = compileArtifactModelToBlueprintV1({ artifactModel });

    assert.equal(typeof compiled.id, 'string');
    assert.equal(compiled.version, 1);
    assert.equal(typeof compiled.name, 'string');
    assert.equal(typeof compiled.description, 'string');
    assert.equal(typeof compiled.kind, 'string');
    assert.equal(typeof compiled.workspaceProfiles, 'object');
    assert.equal(typeof compiled.capabilityProfiles, 'object');
    assert.equal(Array.isArray(compiled.seedEvents), true);
    assert.equal(typeof compiled.seedGraph, 'object');
    assert.equal(typeof compiled.workflowPresets, 'object');
    assert.equal(typeof compiled.publishPresets, 'object');
    assert.equal(compiled.certification.algorithm, 'sha256');
    assert.equal(typeof compiled.certification.hash, 'string');
    assert.equal(typeof compiled.lineage.rootId, 'string');
    assert.equal(typeof compiled.lineage.versionId, 'string');
    assert.equal(compiled.lineage.parentVersionId, null);
});

test('artifact model compiler preserves installer behavior downstream', async () => {
    const artifactModel = planUIUXArtifactModel({ blueprint: createLandingPageBlueprintFixture() });
    const blueprint = compileArtifactModelToBlueprintV1({ artifactModel });
    const manifest = createInstallManifest(blueprint);

    const dispatcherA = createEventDispatcher({ headless: true });
    const dispatcherB = createEventDispatcher({ headless: true });
    dispatcherA.hydrateRuntimeState(initialRuntimeState, { animate: false });
    dispatcherB.hydrateRuntimeState(initialRuntimeState, { animate: false });

    const resultA = await installBlueprint({ dispatcher: dispatcherA, blueprint, manifest });
    const resultB = await installBlueprint({ dispatcher: dispatcherB, blueprint, manifest });
    const stateA = dispatcherA.getState();
    const stateB = dispatcherB.getState();

    assert.equal(resultA.appliedEvents[0]?.type, EventTypes.PROJECT_BLUEPRINT_BOOTSTRAP);
    assert.equal(resultA.appliedEvents[1]?.type, EventTypes.NODE_CREATE);
    assert.equal(resultA.appliedEvents.length, artifactModel.artifacts.length + 2);
    assert.equal(resultB.appliedEvents.length, resultA.appliedEvents.length);
    assert.equal(
        hashCanonicalDocument(stateA.document),
        hashCanonicalDocument(stateB.document),
    );
});
