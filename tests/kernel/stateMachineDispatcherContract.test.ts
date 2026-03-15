import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { adaptWorkspaceToContractV1 } from '@/core/contracts/adaptWorkspaceToContractV1.js';
import { animationWorkspace } from '@/workspaces/registry/animationWorkspace.js';
import {
    createStateMachine,
    createStateMachineState,
} from '@/runtime/stateMachines/index.js';

test('state machine authoring events persist through the live dispatcher path in animation workspace', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(structuredClone(initialRuntimeState), { animate: false });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: adaptWorkspaceToContractV1(animationWorkspace),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.STATE_MACHINE_CREATE,
        payload: {
            machine: createStateMachine({
                id: 'hero-locomotion',
                entryState: 'idle',
                states: [
                    createStateMachineState({
                        id: 'idle',
                        animationRef: 'hero_idle',
                    }),
                    createStateMachineState({
                        id: 'walk',
                        animationRef: 'hero_walk',
                    }),
                ],
            }),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.STATE_MACHINE_SET_ACTIVE,
        payload: {
            machineId: 'hero-locomotion',
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.STATE_MACHINE_PARAMETER_SET,
        payload: {
            machineId: 'hero-locomotion',
            name: 'speed',
            value: 0.8,
        },
    });

    const next = dispatcher.getState();

    assert.equal(next.document.stateMachines.activeMachineId, 'hero-locomotion');
    assert.ok(next.document.stateMachines.machines['hero-locomotion']);
    assert.equal(
        next.document.stateMachines.machines['hero-locomotion'].parameters.speed,
        0.8,
    );
});
