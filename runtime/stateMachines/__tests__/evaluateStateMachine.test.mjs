import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createStateMachine,
    createStateMachineState,
    createStateMachineTransition,
    evaluateStateMachine,
    resolveTransitions,
} from '@/runtime/stateMachines/index.js';

test('resolveTransitions returns the first satisfied deterministic transition', () => {
    const machine = createStateMachine({
        id: 'hero-combat',
        entryState: 'idle',
        states: [
            createStateMachineState({ id: 'idle', animationRef: 'hero_idle' }),
            createStateMachineState({ id: 'walk', animationRef: 'hero_walk' }),
        ],
        transitions: [
            createStateMachineTransition({
                id: 'idle-to-walk',
                from: 'idle',
                to: 'walk',
                condition: {
                    parameter: 'speed',
                    operator: '>',
                    value: 0.1,
                },
                blendDuration: 0.25,
            }),
        ],
        parameters: {
            speed: 0.6,
        },
    });

    const transition = resolveTransitions(machine, {
        activeStateId: 'idle',
        parameters: machine.parameters,
    });

    assert.equal(transition?.id, 'idle-to-walk');
    assert.equal(transition?.to, 'walk');
});

test('evaluateStateMachine produces active clip selection output for future blending', () => {
    const machine = createStateMachine({
        id: 'hero-combat',
        entryState: 'idle',
        states: [
            createStateMachineState({ id: 'idle', animationRef: 'hero_idle' }),
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
            attack: true,
        },
    });

    const evaluation = evaluateStateMachine(machine, {
        activeStateId: 'idle',
        parameters: machine.parameters,
    });

    assert.equal(evaluation.activeStateId, 'punch');
    assert.equal(evaluation.activeClips.length, 1);
    assert.deepEqual(evaluation.activeClips[0], {
        clipRef: 'hero_punch',
        weight: 1,
        source: 'state-machine',
        stateId: 'punch',
        blendDuration: 0.1,
    });
});
