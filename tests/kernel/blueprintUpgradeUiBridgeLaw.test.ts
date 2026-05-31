import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import {
    applyBlueprintUpgradeFromCatalog,
    installBlueprintFromCatalog,
    listBlueprintUpgradeTargets,
    previewBlueprintUpgradeFromCatalog,
} from '@/ui/bridges/blueprintInstallBridge.js';

function createManifestBootstrap() {
    return Object.freeze({
        projectId: 'project.bp.bridge.law',
        projectName: 'Blueprint Bridge Law',
        defaultPerspectiveId: 'create',
        blueprintId: 'bp.startup.v1',
        blueprintVersionId: 'bp.startup.v1',
    });
}

test('blueprint upgrade bridge resolves deterministic target and preview for installed startup v1', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });

    await installBlueprintFromCatalog({
        dispatcher,
        blueprintId: 'bp.startup.v1',
        blueprintVersionId: 'bp.startup.v1',
        projectId: 'project.bp.bridge.law',
        projectName: 'Blueprint Bridge Law',
        defaultPerspectiveId: 'create',
    });

    const bootstrap = dispatcher.getState()?.document?.meta?.projectBootstrap ?? null;
    assert.equal(bootstrap?.blueprintVersionId, 'bp.startup.v1');

    const targets = listBlueprintUpgradeTargets({ projectBootstrap: bootstrap });
    assert.equal(targets.length >= 1, true);
    assert.equal(targets[0].versionId, 'bp.startup.v2');

    const previewA = previewBlueprintUpgradeFromCatalog({
        projectBootstrap: bootstrap,
        targetBlueprintVersionId: 'bp.startup.v2',
    });
    const previewB = previewBlueprintUpgradeFromCatalog({
        projectBootstrap: bootstrap,
        targetBlueprintVersionId: 'bp.startup.v2',
    });
    assert.deepEqual(
        {
            fromVersionId: previewA.fromVersionId,
            toVersionId: previewA.toVersionId,
            addedCount: previewA.addedCount,
            changedCount: previewA.changedCount,
            removedCount: previewA.removedCount,
            canApply: previewA.canApply,
        },
        {
            fromVersionId: previewB.fromVersionId,
            toVersionId: previewB.toVersionId,
            addedCount: previewB.addedCount,
            changedCount: previewB.changedCount,
            removedCount: previewB.removedCount,
            canApply: previewB.canApply,
        },
    );
    assert.equal(previewA.canApply, true);
});

test('blueprint upgrade bridge applies through dispatcher only when preview passes', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });

    await installBlueprintFromCatalog({
        dispatcher,
        blueprintId: 'bp.startup.v1',
        blueprintVersionId: 'bp.startup.v1',
        ...createManifestBootstrap(),
    });

    const bootstrap = dispatcher.getState()?.document?.meta?.projectBootstrap ?? null;
    const result = await applyBlueprintUpgradeFromCatalog({
        dispatcher,
        projectBootstrap: bootstrap,
        targetBlueprintVersionId: 'bp.startup.v2',
    });

    assert.equal(result.fromVersionId, 'bp.startup.v1');
    assert.equal(result.toVersionId, 'bp.startup.v2');
    assert.equal(result.addedCount >= 1, true);
});

