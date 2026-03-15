import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { replayEvents } from '@/runtime/dispatcher/replayEvents.js';
import {
    createRig,
    createRigConstraint,
    createRigController,
} from '@/runtime/rigging/rigRegistry.js';

test('rig events write truth into document.rigs through the canonical replay path', async () => {
    const rig = createRig({
        id: 'hero-rig',
        rootNode: 'hero-node',
    });
    const controller = createRigController({
        id: 'ctrl-root',
        label: 'Root',
        nodeRef: 'hero-root',
        channels: ['transform.x', 'transform.y'],
    });
    const constraint = createRigConstraint({
        id: 'parent-hand',
        type: 'parent',
        parentControllerId: 'ctrl-root',
        childNode: 'hand-node',
    });

    const next = replayEvents({
        initialState: structuredClone(initialRuntimeState),
        events: [
            {
                type: EventTypes.RIG_CREATE,
                payload: { rig },
            },
            {
                type: EventTypes.RIG_CONTROLLER_CREATE,
                payload: {
                    rigId: 'hero-rig',
                    controller,
                },
            },
            {
                type: EventTypes.RIG_CONSTRAINT_CREATE,
                payload: {
                    rigId: 'hero-rig',
                    constraint,
                },
            },
            {
                type: EventTypes.RIG_SET_ACTIVE,
                payload: {
                    rigId: 'hero-rig',
                },
            },
        ],
    });

    assert.equal(next.document.rigs.activeRigId, 'hero-rig');
    assert.deepEqual(next.document.rigs.rigs['hero-rig'].controllers['ctrl-root'], controller);
    assert.deepEqual(next.document.rigs.rigs['hero-rig'].constraints['parent-hand'], constraint);
});
