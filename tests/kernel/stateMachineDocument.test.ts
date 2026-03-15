import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { replayEvents } from '@/runtime/dispatcher/replayEvents.js';
import {
    createStateMachine,
    createStateMachineState,
    createStateMachineTransition,
} from '@/runtime/stateMachines/index.js';

test('state machine events write truth into document.stateMachines through the canonical replay path', async () => {
    const machine = createStateMachine({
        id: 'hero-combat',
        label: 'Hero Combat',
        entryState: 'idle',
        states: [
            createStateMachineState({
                id: 'idle',
                animationRef: 'hero_idle',
            }),
            createStateMachineState({
                id: 'punch',
                animationRef: 'hero_punch',
                blendDuration: 0.12,
            }),
        ],
        transitions: [
            createStateMachineTransition({
                id: 'idle-to-punch',
                from: 'idle',
                to: 'punch',
                condition: {
                    parameter: 'attack',
                    operator: 'truthy',
                },
                blendDuration: 0.1,
            }),
        ],
        parameters: {
            attack: false,
        },
    });

    const next = replayEvents({
        initialState: structuredClone(initialRuntimeState),
        events: [
            {
                type: EventTypes.STATE_MACHINE_CREATE,
                payload: { machine },
            },
            {
                type: EventTypes.STATE_MACHINE_SET_ACTIVE,
                payload: { machineId: 'hero-combat' },
            },
            {
                type: EventTypes.STATE_MACHINE_PARAMETER_SET,
                payload: {
                    machineId: 'hero-combat',
                    name: 'attack',
                    value: true,
                },
            },
        ],
    });

    assert.equal(next.document.stateMachines.activeMachineId, 'hero-combat');
    assert.equal(
        next.document.stateMachines.machines['hero-combat'].parameters.attack,
        true,
    );
    assert.equal(
        next.document.stateMachines.machines['hero-combat'].transitions[0].to,
        'punch',
    );
});
