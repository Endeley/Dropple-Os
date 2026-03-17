import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateSceneAnimation } from '../evaluateSceneAnimation.js';

test('evaluateSceneAnimation returns a transform map', () => {
    const snapshot = {
        document: {
            rigs: [{ id: 'characterRig' }],
            motion: {},
            choreography: {},
        },
        runtime: {
            scene: {
                computed: {},
            },
        },
    };

    const transforms = evaluateSceneAnimation(snapshot, {});

    assert.ok(typeof transforms === 'object');
    assert.deepEqual(transforms, {});
});

test('evaluateSceneAnimation samples rig motion and returns constrained node transforms', () => {
    const snapshot = {
        document: {
            rigs: [
                {
                    id: 'heroRig',
                    controllers: [
                        {
                            id: 'ctrl-hand',
                            nodeId: 'hand-node',
                            channels: ['x', 'y', 'rotation'],
                        },
                    ],
                    constraints: {
                        handFollow: {
                            id: 'handFollow',
                            type: 'parent',
                            parentControllerId: 'ctrl-hand',
                            childNode: 'hand-bone',
                        },
                    },
                },
            ],
            motion: {
                'hand-node': {
                    x: {
                        keyframes: [{ frame: 0, value: 10 }],
                    },
                    y: {
                        keyframes: [{ frame: 0, value: 20 }],
                    },
                    rotation: {
                        keyframes: [{ frame: 0, value: 30 }],
                    },
                },
            },
            choreography: {},
        },
        playback: {
            frame: 0,
        },
        runtime: {
            scene: {
                computed: {
                    'hand-bone': {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
    };

    const transforms = evaluateSceneAnimation(snapshot, { frame: 0 });

    assert.deepEqual(transforms, {
        'hand-bone': {
            x: 10,
            y: 20,
            rotation: 30,
        },
    });
});

test('evaluateSceneAnimation includes graph layers in rig animation evaluation', () => {
    const snapshot = {
        document: {
            rigs: [
                {
                    id: 'heroRig',
                    controllers: [
                        {
                            id: 'ctrl-hand',
                            nodeId: 'hand-node',
                            channels: ['x'],
                        },
                    ],
                    constraints: {
                        handFollow: {
                            id: 'handFollow',
                            type: 'parent',
                            parentControllerId: 'ctrl-hand',
                            childNode: 'hand-bone',
                        },
                    },
                },
            ],
            motion: {},
            graphs: [
                {
                    id: 'heroGraph',
                    rigId: 'heroRig',
                    nodes: [
                        {
                            id: 'handX',
                            type: 'value',
                            controllerId: 'ctrl-hand',
                            channel: 'x',
                            value: 42,
                        },
                    ],
                    output: 'handX',
                },
            ],
            choreography: {},
        },
        runtime: {
            scene: {
                computed: {},
            },
        },
    };

    const transforms = evaluateSceneAnimation(snapshot, { frame: 0 });

    assert.deepEqual(transforms, {
        'hand-bone': {
            x: 42,
        },
    });
});

test('evaluateSceneAnimation passes state-machine parameters into graph parameter nodes', () => {
    const snapshot = {
        document: {
            rigs: [
                {
                    id: 'heroRig',
                    controllers: [
                        {
                            id: 'ctrl-hand',
                            nodeId: 'hand-node',
                            channels: ['x'],
                        },
                    ],
                    constraints: {
                        handFollow: {
                            id: 'handFollow',
                            type: 'parent',
                            parentControllerId: 'ctrl-hand',
                            childNode: 'hand-bone',
                        },
                    },
                },
            ],
            motion: {},
            stateMachines: {
                locomotion: {
                    states: [
                        {
                            id: 'run',
                            parameters: {
                                speed: 9,
                            },
                        },
                    ],
                },
            },
            graphs: [
                {
                    id: 'heroGraph',
                    rigId: 'heroRig',
                    nodes: [
                        {
                            id: 'speedParam',
                            type: 'parameter',
                            name: 'speed',
                            default: 0,
                            controllerId: 'ctrl-hand',
                            channel: 'x',
                        },
                    ],
                    output: 'speedParam',
                },
            ],
            choreography: {},
        },
        runtime: {
            stateMachines: {
                locomotion: { current: 'run' },
            },
            scene: {
                computed: {},
            },
        },
    };

    const transforms = evaluateSceneAnimation(snapshot, { frame: 0 });

    assert.deepEqual(transforms, {
        'hand-bone': {
            x: 9,
        },
    });
});
