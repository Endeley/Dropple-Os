import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { installBlueprint } from '@/runtime/blueprints/installBlueprint.js';
import { applyBlueprintUpgrade } from '@/runtime/blueprints/applyBlueprintUpgrade.js';
import { hashCanonicalDocument } from '@/core/persistence/hashDocument.js';

function createBaseBlueprint() {
    return Object.freeze({
        id: 'bp.base.v1',
        version: 1,
        name: 'Base Blueprint',
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
            rootId: 'bp.base.root',
            versionId: 'bp.base.v1',
            parentVersionId: null,
        }),
    });
}

function createUpgradedBlueprint() {
    const base = createBaseBlueprint();
    return Object.freeze({
        ...base,
        id: 'bp.base.v2',
        seedEvents: Object.freeze([
            ...base.seedEvents,
            Object.freeze({
                type: EventTypes.NODE_CREATE,
                payload: { node: { id: 'b', type: 'frame', parentId: 'a' } },
            }),
        ]),
        lineage: Object.freeze({
            rootId: base.lineage.rootId,
            versionId: 'bp.base.v2',
            parentVersionId: base.lineage.versionId,
        }),
    });
}

test('blueprint upgrade applies additive diff events only through dispatcher', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });

    const base = createBaseBlueprint();
    const upgrade = createUpgradedBlueprint();
    await installBlueprint({ dispatcher, blueprint: base });
    const before = dispatcher.getState();

    const result = await applyBlueprintUpgrade({
        dispatcher,
        fromBlueprint: base,
        toBlueprint: upgrade,
    });
    const after = dispatcher.getState();

    assert.equal(result.addedCount, 1);
    assert.equal(result.appliedEvents.length, 1);
    assert.equal(after.events.length, before.events.length + 1);
    assert.equal(after.nodes.a?.id, 'a');
    assert.equal(after.nodes.b?.parentId, 'a');
});

test('blueprint upgrade fails closed on lineage mismatch', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });

    const base = createBaseBlueprint();
    const invalidUpgrade = {
        ...createUpgradedBlueprint(),
        lineage: {
            rootId: 'bp.other.root',
            versionId: 'bp.base.v2',
            parentVersionId: 'bp.base.v1',
        },
    };

    await installBlueprint({ dispatcher, blueprint: base });
    await assert.rejects(
        () =>
            applyBlueprintUpgrade({
                dispatcher,
                fromBlueprint: base,
                toBlueprint: invalidUpgrade,
            }),
        /lineage root mismatch/,
    );
});

test('blueprint upgrade is deterministic across equivalent installs', async () => {
    const base = createBaseBlueprint();
    const upgrade = createUpgradedBlueprint();

    const a = createEventDispatcher({ headless: true });
    const b = createEventDispatcher({ headless: true });
    a.hydrateRuntimeState(initialRuntimeState, { animate: false });
    b.hydrateRuntimeState(initialRuntimeState, { animate: false });

    await installBlueprint({ dispatcher: a, blueprint: base });
    await applyBlueprintUpgrade({ dispatcher: a, fromBlueprint: base, toBlueprint: upgrade });

    await installBlueprint({ dispatcher: b, blueprint: base });
    await applyBlueprintUpgrade({ dispatcher: b, fromBlueprint: base, toBlueprint: upgrade });

    assert.equal(
        hashCanonicalDocument(a.getState().document),
        hashCanonicalDocument(b.getState().document),
    );
});
