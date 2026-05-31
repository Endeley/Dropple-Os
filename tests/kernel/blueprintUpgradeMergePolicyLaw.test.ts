import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { installBlueprint } from '@/runtime/blueprints/installBlueprint.js';
import { applyBlueprintUpgrade } from '@/runtime/blueprints/applyBlueprintUpgrade.js';
import { evaluateBlueprintUpgradeMergePolicy } from '@/runtime/blueprints/blueprintUpgradeMergePolicy.js';
import { certifyBlueprint } from '@/runtime/blueprints/installBlueprint.js';

function createBaseBlueprint() {
    return Object.freeze({
        id: 'bp.policy.base.v1',
        version: 1,
        name: 'Policy Base Blueprint',
        description: 'base',
        kind: 'project',
        workspaceProfiles: Object.freeze({ create: ['uiux'] }),
        capabilityProfiles: Object.freeze({ create: ['node:create'] }),
        seedGraph: Object.freeze({ nodes: {}, rootIds: [] }),
        seedEvents: Object.freeze([
            Object.freeze({
                type: EventTypes.NODE_CREATE,
                payload: { node: { id: 'a', type: 'frame' } },
            }),
        ]),
        workflowPresets: Object.freeze({}),
        publishPresets: Object.freeze({}),
        certification: Object.freeze({ algorithm: 'sha256', hash: 'placeholder' }),
        lineage: Object.freeze({
            rootId: 'bp.policy.base.root',
            versionId: 'bp.policy.base.v1',
            parentVersionId: null,
        }),
    });
}

function createAllowedUpgradeBlueprint() {
    const base = createBaseBlueprint();
    const upgrade = {
        ...base,
        id: 'bp.policy.base.v2',
        seedEvents: Object.freeze([
            ...base.seedEvents,
            Object.freeze({
                type: EventTypes.NODE_CREATE,
                payload: { node: { id: 'b', type: 'frame', parentId: 'a' } },
            }),
        ]),
        certification: Object.freeze({
            ...base.certification,
            hash: 'upgrade-cert-hash',
        }),
        lineage: Object.freeze({
            rootId: base.lineage.rootId,
            versionId: 'bp.policy.base.v2',
            parentVersionId: base.lineage.versionId,
        }),
    };
    return certifyBlueprint(upgrade);
}

function createDisallowedUpgradeBlueprint() {
    const allowed = createAllowedUpgradeBlueprint();
    const disallowed = {
        ...allowed,
        workspaceProfiles: Object.freeze({ create: ['uiux', 'graphic'] }),
    };
    return certifyBlueprint(disallowed);
}

function createInstallManifest(blueprintId = 'bp.policy.base.v1', blueprintVersionId = 'bp.policy.base.v1') {
    return Object.freeze({
        schemaVersion: 1,
        projectId: 'project.blueprint.policy',
        projectName: 'Blueprint Policy Project',
        defaultPerspectiveId: 'build',
        blueprintId,
        blueprintVersionId,
    });
}

test('blueprint merge policy evaluation is deterministic', () => {
    const base = createBaseBlueprint();
    const disallowed = createDisallowedUpgradeBlueprint();
    const left = evaluateBlueprintUpgradeMergePolicy({
        fromBlueprint: base,
        toBlueprint: disallowed,
    });
    const right = evaluateBlueprintUpgradeMergePolicy({
        fromBlueprint: base,
        toBlueprint: disallowed,
    });

    assert.deepEqual(left, right);
    assert.equal(left.ok, false);
    assert.equal(left.disallowedPaths.includes('workspaceProfiles.create'), true);
});

test('blueprint upgrade accepts policy-allowed path changes and remains dispatcher-owned', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });

    const base = createBaseBlueprint();
    const allowed = createAllowedUpgradeBlueprint();
    await installBlueprint({ dispatcher, blueprint: base, manifest: createInstallManifest(base.id, base.lineage.versionId) });
    const before = dispatcher.getState();

    const result = await applyBlueprintUpgrade({
        dispatcher,
        fromBlueprint: base,
        toBlueprint: allowed,
    });
    const after = dispatcher.getState();

    assert.equal(result.addedCount, 1);
    assert.equal(after.events.length, before.events.length + 1);
    assert.equal(after.nodes.b?.parentId, 'a');
});

test('blueprint upgrade rejects disallowed merge-policy path changes and preserves truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });

    const base = createBaseBlueprint();
    const disallowed = createDisallowedUpgradeBlueprint();
    await installBlueprint({ dispatcher, blueprint: base, manifest: createInstallManifest(base.id, base.lineage.versionId) });
    const before = dispatcher.getState();

    await assert.rejects(
        () =>
            applyBlueprintUpgrade({
                dispatcher,
                fromBlueprint: base,
                toBlueprint: disallowed,
            }),
        /merge policy rejected disallowed changed paths/,
    );

    const after = dispatcher.getState();
    assert.equal(after.events.length, before.events.length);
    assert.equal(after.nodes.b, undefined);
});
