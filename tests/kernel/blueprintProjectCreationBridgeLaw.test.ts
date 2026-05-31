import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { hashCanonicalDocument } from '@/core/persistence/hashDocument.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import {
    createProjectFromBlueprintCatalog,
    installBlueprintFromCatalog,
    installComposedBlueprintFromCatalog,
} from '@/ui/bridges/blueprintInstallBridge.js';

function createDispatcher() {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });
    return dispatcher;
}

test('project creation canonical entrypoint is deterministic for a single blueprint', async () => {
    const left = createDispatcher();
    const right = createDispatcher();
    const args = Object.freeze({
        blueprintEntries: Object.freeze([
            Object.freeze({
                blueprintId: 'bp.startup.v1',
                blueprintVersionId: 'bp.startup.v1',
            }),
        ]),
        projectId: 'project.canonical.single',
        projectName: 'Canonical Single',
        defaultPerspectiveId: 'create',
    });

    const leftResult = await createProjectFromBlueprintCatalog({ dispatcher: left, ...args });
    const rightResult = await createProjectFromBlueprintCatalog({ dispatcher: right, ...args });
    assert.equal(leftResult.composed, false);
    assert.equal(left.getState().events[0].type, EventTypes.PROJECT_BLUEPRINT_BOOTSTRAP);
    assert.equal(hashCanonicalDocument(left.getState().document), hashCanonicalDocument(right.getState().document));
    assert.deepEqual(leftResult.sourceBlueprints, rightResult.sourceBlueprints);
});

test('legacy bridge install helpers delegate to canonical project creation entrypoint', async () => {
    const fromSingle = createDispatcher();
    const fromCanonicalSingle = createDispatcher();
    const fromComposed = createDispatcher();
    const fromCanonicalComposed = createDispatcher();

    await installBlueprintFromCatalog({
        dispatcher: fromSingle,
        blueprintId: 'bp.startup.v1',
        blueprintVersionId: 'bp.startup.v1',
        projectId: 'project.compat.single',
        projectName: 'Compat Single',
        defaultPerspectiveId: 'create',
    });
    await createProjectFromBlueprintCatalog({
        dispatcher: fromCanonicalSingle,
        blueprintEntries: [
            { blueprintId: 'bp.startup.v1', blueprintVersionId: 'bp.startup.v1' },
        ],
        projectId: 'project.compat.single',
        projectName: 'Compat Single',
        defaultPerspectiveId: 'create',
    });

    await installComposedBlueprintFromCatalog({
        dispatcher: fromComposed,
        blueprintEntries: [
            { blueprintId: 'bp.startup.v1' },
            { blueprintId: 'bp.logistics.v1' },
        ],
        projectId: 'project.compat.composed',
        projectName: 'Compat Composed',
        defaultPerspectiveId: 'create',
    });
    await createProjectFromBlueprintCatalog({
        dispatcher: fromCanonicalComposed,
        blueprintEntries: [
            { blueprintId: 'bp.startup.v1' },
            { blueprintId: 'bp.logistics.v1' },
        ],
        projectId: 'project.compat.composed',
        projectName: 'Compat Composed',
        defaultPerspectiveId: 'create',
    });

    assert.equal(
        hashCanonicalDocument(fromSingle.getState().document),
        hashCanonicalDocument(fromCanonicalSingle.getState().document),
    );
    assert.equal(
        hashCanonicalDocument(fromComposed.getState().document),
        hashCanonicalDocument(fromCanonicalComposed.getState().document),
    );
});
