import test from 'node:test';
import assert from 'node:assert/strict';

import { applyStateMachineParameters } from '../state/applyStateMachineParameters.js';

test('applyStateMachineParameters extracts parameters from the active state', () => {
    const params = applyStateMachineParameters({
        document: {
            stateMachines: {
                locomotion: {
                    states: {
                        run: {
                            parameters: { speed: 1 },
                        },
                    },
                },
            },
        },
        runtime: {
            stateMachines: {
                locomotion: { current: 'run' },
            },
        },
    });

    assert.deepEqual({ ...params }, { speed: 1 });
});

test('applyStateMachineParameters returns an empty parameter map when state is missing', () => {
    const params = applyStateMachineParameters({
        document: {},
        runtime: {},
    });

    assert.deepEqual({ ...params }, {});
});

test('applyStateMachineParameters merges multiple machines deterministically', () => {
    const document = {
        stateMachines: {
            b: {
                states: {
                    active: { parameters: { y: 2 } },
                },
            },
            a: {
                states: {
                    active: { parameters: { x: 1 } },
                },
            },
        },
    };
    const runtime = {
        stateMachines: {
            a: { current: 'active' },
            b: { current: 'active' },
        },
    };

    const left = applyStateMachineParameters({ document, runtime });
    const right = applyStateMachineParameters({ document, runtime });

    assert.deepEqual({ ...left }, { ...right });
    assert.deepEqual({ ...left }, { x: 1, y: 2 });
});

test('applyStateMachineParameters supports array-backed states and normalizes values', () => {
    const params = applyStateMachineParameters({
        document: {
            stateMachines: {
                control: {
                    states: [
                        {
                            id: 'aim',
                            params: {
                                enabled: true,
                                bias: '2.5',
                                invalid: 'nope',
                            },
                        },
                    ],
                },
            },
        },
        runtime: {
            stateMachines: {
                control: { activeState: 'aim' },
            },
        },
    });

    assert.deepEqual({ ...params }, {
        bias: 2.5,
        enabled: 1,
        invalid: 0,
    });
});
