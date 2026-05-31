import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { installBlueprint } from '@/runtime/blueprints/installBlueprint.js';
import { applyBlueprintUpgrade } from '@/runtime/blueprints/applyBlueprintUpgrade.js';
import { diffBlueprintUpgrade } from '@/runtime/blueprints/diffBlueprintUpgrade.js';

function createBaseBlueprint() {
    return Object.freeze({
        id: 'bp.conflict.base.v1',
        version: 1,
        name: 'Conflict Base Blueprint',
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
            Object.freeze({
                type: EventTypes.NODE_CREATE,
                payload: { node: { id: 'b', type: 'frame', parentId: 'a' } },
            }),
        ]),
        workflowPresets: Object.freeze({}),
        publishPresets: Object.freeze({}),
        certification: Object.freeze({ algorithm: 'sha256', hash: 'placeholder' }),
        lineage: Object.freeze({
            rootId: 'bp.conflict.base.root',
            versionId: 'bp.conflict.base.v1',
            parentVersionId: null,
        }),
    });
}

function createReorderedUpgradeBlueprint() {
    const base = createBaseBlueprint();
    return Object.freeze({
        ...base,
        id: 'bp.conflict.base.v2',
        seedEvents: Object.freeze([base.seedEvents[1], base.seedEvents[0]]),
        lineage: Object.freeze({
            rootId: base.lineage.rootId,
            versionId: 'bp.conflict.base.v2',
            parentVersionId: base.lineage.versionId,
        }),
    });
}

function createRemovalUpgradeBlueprint() {
    const base = createBaseBlueprint();
    return Object.freeze({
        ...base,
        id: 'bp.conflict.base.v3',
        seedEvents: Object.freeze([base.seedEvents[0]]),
        lineage: Object.freeze({
            rootId: base.lineage.rootId,
            versionId: 'bp.conflict.base.v3',
            parentVersionId: base.lineage.versionId,
        }),
    });
}

test('blueprint diff classifies reorder as conflict deterministically', () => {
    const base = createBaseBlueprint();
    const reorder = createReorderedUpgradeBlueprint();

    const left = diffBlueprintUpgrade({ fromBlueprint: base, toBlueprint: reorder });
    const right = diffBlueprintUpgrade({ fromBlueprint: base, toBlueprint: reorder });

    assert.deepEqual(left, right);
    assert.equal(left.added.length, 0);
    assert.equal(left.removed.length, 0);
    assert.equal(left.changed.length, 2);
    assert.equal(left.hasConflicts, true);
    assert.equal(left.additiveOnly, false);
    assert.equal(left.conflictCount, 2);
});

test('blueprint diff classifies removals as conflict deterministically', () => {
    const base = createBaseBlueprint();
    const removal = createRemovalUpgradeBlueprint();
    const diff = diffBlueprintUpgrade({ fromBlueprint: base, toBlueprint: removal });

    assert.equal(diff.added.length, 0);
    assert.equal(diff.removed.length, 1);
    assert.equal(diff.changed.length, 0);
    assert.equal(diff.hasConflicts, true);
    assert.equal(diff.additiveOnly, false);
    assert.equal(diff.conflictCount, 1);
});

test('blueprint upgrade fails closed on non-additive diff and preserves runtime truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });

    const base = createBaseBlueprint();
    const reorder = createReorderedUpgradeBlueprint();
    await installBlueprint({ dispatcher, blueprint: base });
    const before = dispatcher.getState();

    await assert.rejects(
        () =>
            applyBlueprintUpgrade({
                dispatcher,
                fromBlueprint: base,
                toBlueprint: reorder,
            }),
        /upgrade must be additive/,
    );

    const after = dispatcher.getState();
    assert.equal(after.events.length, before.events.length);
    assert.equal(after.nodes.a?.id, 'a');
    assert.equal(after.nodes.b?.id, 'b');
});
