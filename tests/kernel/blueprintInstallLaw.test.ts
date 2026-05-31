import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { hashCanonicalDocument } from '@/core/persistence/hashDocument.js';
import { installBlueprint } from '@/runtime/blueprints/installBlueprint.js';

function createBlueprintFixture() {
    return Object.freeze({
        id: 'bp.startup.v1',
        version: 1,
        name: 'Startup Blueprint',
        description: 'Minimal lawful startup blueprint seed',
        kind: 'project',
        workspaceProfiles: Object.freeze({
            create: ['uiux', 'graphic'],
            build: ['application'],
        }),
        capabilityProfiles: Object.freeze({
            create: ['node:create', 'node:update'],
            build: ['workflow:define'],
        }),
        seedGraph: Object.freeze({
            nodes: {
                'frame.root': { id: 'frame.root', type: 'frame' },
            },
            rootIds: ['frame.root'],
        }),
        seedEvents: Object.freeze([
            Object.freeze({
                type: EventTypes.NODE_CREATE,
                payload: {
                    node: {
                        id: 'frame.root',
                        type: 'frame',
                        layout: { x: 0, y: 0, width: 1280, height: 720 },
                    },
                },
            }),
            Object.freeze({
                type: EventTypes.NODE_CREATE,
                payload: {
                    node: {
                        id: 'frame.child',
                        type: 'frame',
                        parentId: 'frame.root',
                        layout: { x: 64, y: 64, width: 480, height: 300 },
                    },
                },
            }),
        ]),
        workflowPresets: Object.freeze({}),
        publishPresets: Object.freeze({}),
        certification: Object.freeze({
            algorithm: 'sha256',
            hash: 'placeholder',
        }),
        lineage: Object.freeze({
            rootId: 'bp.startup.root',
            versionId: 'bp.startup.v1',
            parentVersionId: null,
        }),
    });
}

test('blueprint install emits canonical events through dispatcher and mutates no truth directly', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });

    const blueprint = createBlueprintFixture();
    const beforeBlueprint = structuredClone(blueprint);

    const result = await installBlueprint({ dispatcher, blueprint });
    const afterState = dispatcher.getState();

    assert.equal(result.appliedEvents.length, blueprint.seedEvents.length);
    assert.equal(afterState.events.length, blueprint.seedEvents.length);
    assert.equal(afterState.events[0].type, EventTypes.NODE_CREATE);
    assert.equal(afterState.events[1].type, EventTypes.NODE_CREATE);
    assert.match(afterState.events[0].id, /^main:\d+$/);
    assert.match(afterState.events[1].id, /^main:\d+$/);
    assert.deepEqual(blueprint, beforeBlueprint);
});

test('blueprint install is deterministic across equivalent installs', async () => {
    const blueprint = createBlueprintFixture();
    const dispatcherA = createEventDispatcher({ headless: true });
    const dispatcherB = createEventDispatcher({ headless: true });
    dispatcherA.hydrateRuntimeState(initialRuntimeState, { animate: false });
    dispatcherB.hydrateRuntimeState(initialRuntimeState, { animate: false });

    await installBlueprint({ dispatcher: dispatcherA, blueprint });
    await installBlueprint({ dispatcher: dispatcherB, blueprint });

    const installedStateA = dispatcherA.getState();
    const installedStateB = dispatcherB.getState();
    assert.equal(
        hashCanonicalDocument(installedStateA.document),
        hashCanonicalDocument(installedStateB.document),
    );
});
