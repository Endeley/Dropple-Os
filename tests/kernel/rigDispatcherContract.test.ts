import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { adaptWorkspaceToContractV1 } from '@/core/contracts/adaptWorkspaceToContractV1.js';
import { animationWorkspace } from '@/workspaces/registry/animationWorkspace.js';
import {
    createRig,
    createRigConstraint,
    createRigController,
} from '@/runtime/rigging/rigRegistry.js';

test('rig events persist through the live dispatcher path in animation workspace', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(structuredClone(initialRuntimeState), { animate: false });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: adaptWorkspaceToContractV1(animationWorkspace),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.RIG_CREATE,
        payload: {
            rig: createRig({
                id: 'hero-rig',
                rootNode: 'hero-node',
            }),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.RIG_CONTROLLER_CREATE,
        payload: {
            rigId: 'hero-rig',
            controller: createRigController({
                id: 'ctrl-root',
                label: 'Root',
                nodeRef: 'hero-root',
                channels: ['transform.x', 'transform.y'],
            }),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.RIG_CONSTRAINT_CREATE,
        payload: {
            rigId: 'hero-rig',
            constraint: createRigConstraint({
                id: 'parent-hand',
                type: 'parent',
                parentControllerId: 'ctrl-root',
                childNode: 'hand-node',
            }),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.RIG_SET_ACTIVE,
        payload: {
            rigId: 'hero-rig',
        },
    });

    const next = dispatcher.getState();

    assert.equal(next.document.rigs.activeRigId, 'hero-rig');
    assert.ok(next.document.rigs.rigs['hero-rig']);
    assert.ok(next.document.rigs.rigs['hero-rig'].controllers['ctrl-root']);
    assert.ok(next.document.rigs.rigs['hero-rig'].constraints['parent-hand']);
});
