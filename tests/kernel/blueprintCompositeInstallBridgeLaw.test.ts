import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { hashCanonicalDocument } from '@/core/persistence/hashDocument.js';
import { installComposedBlueprintFromCatalog } from '@/ui/bridges/blueprintInstallBridge.js';

function createDispatcher() {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });
    return dispatcher;
}

test('composed blueprint catalog install stays dispatcher-owned and deterministic', async () => {
    const leftDispatcher = createDispatcher();
    const rightDispatcher = createDispatcher();
    const payload = Object.freeze({
        blueprintEntries: Object.freeze([
            Object.freeze({ blueprintId: 'bp.startup.v1' }),
            Object.freeze({ blueprintId: 'bp.logistics.v1' }),
        ]),
        projectId: 'project.compose.startup-logistics',
        projectName: 'Startup Logistics',
        defaultPerspectiveId: 'create',
    });

    const left = await installComposedBlueprintFromCatalog({
        dispatcher: leftDispatcher,
        ...payload,
    });
    const right = await installComposedBlueprintFromCatalog({
        dispatcher: rightDispatcher,
        ...payload,
    });

    const leftState = leftDispatcher.getState();
    const rightState = rightDispatcher.getState();

    assert.equal(left.composed, true);
    assert.equal(leftState.events[0].type, EventTypes.PROJECT_BLUEPRINT_BOOTSTRAP);
    assert.equal(leftState.document.meta.projectBootstrap?.defaultPerspectiveId, 'create');
    assert.equal(leftState.events.length > 2, true);
    assert.equal(hashCanonicalDocument(leftState.document), hashCanonicalDocument(rightState.document));
    assert.deepEqual(left.appliedEvents.map((event) => event.type), right.appliedEvents.map((event) => event.type));
});
