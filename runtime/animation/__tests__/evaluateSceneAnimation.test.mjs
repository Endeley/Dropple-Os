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

test('evaluateSceneAnimation resolves graph authority per rig deterministically', () => {
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
                    id: 'lowGraph',
                    rigId: 'heroRig',
                    nodes: [
                        {
                            id: 'lowValue',
                            type: 'value',
                            controllerId: 'ctrl-hand',
                            channel: 'x',
                            value: 5,
                        },
                    ],
                    output: 'lowValue',
                },
                {
                    id: 'highGraph',
                    rigId: 'heroRig',
                    nodes: [
                        {
                            id: 'highValue',
                            type: 'value',
                            controllerId: 'ctrl-hand',
                            channel: 'x',
                            value: 12,
                        },
                    ],
                    output: 'highValue',
                },
            ],
        },
        runtime: {
            scene: {
                computed: {},
            },
        },
    };

    const left = evaluateSceneAnimation(snapshot, {
        frame: 0,
        graphLayerMeta: {
            'graph:highGraph:layer:0': { priority: 10 },
            'graph:lowGraph:layer:0': { priority: 1 },
        },
    });
    const right = evaluateSceneAnimation(snapshot, {
        frame: 0,
        graphLayerMeta: {
            'graph:lowGraph:layer:0': { priority: 1 },
            'graph:highGraph:layer:0': { priority: 10 },
        },
    });

    assert.deepEqual(left, right);
    assert.deepEqual(left, {
        'hand-bone': {
            x: 12,
        },
    });
});

test('evaluateSceneAnimation applies document constraint stack after rig evaluation', () => {
    const snapshot = {
        document: {
            rigs: [
                {
                    id: 'heroRig',
                    controllers: [
                        {
                            id: 'ctrl-hand',
                            nodeId: 'hand-node',
                            channels: ['rotation'],
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
                    rotation: {
                        keyframes: [{ frame: 0, value: 10 }],
                    },
                },
            },
            constraints: [
                {
                    id: 'limitHand',
                    type: 'limitRotation',
                    target: 'hand-bone',
                    min: -1,
                    max: 1,
                },
            ],
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
            rotation: 1,
        },
    });
});

test('evaluateSceneAnimation composes global and rig-scoped graphs deterministically for the same rig', () => {
    const graphA = {
        id: 'globalGraph',
        rigId: null,
        priority: 1,
        nodes: [
            {
                id: 'globalValue',
                type: 'value',
                controllerId: 'ctrl-hand',
                channel: 'x',
                value: 4,
            },
        ],
        output: 'globalValue',
    };
    const graphB = {
        id: 'rigGraph',
        rigId: 'heroRig',
        priority: 2,
        nodes: [
            {
                id: 'rigValue',
                type: 'value',
                controllerId: 'ctrl-hand',
                channel: 'x',
                value: 7,
            },
        ],
        output: 'rigValue',
    };

    const makeSnapshot = (graphs) => ({
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
            graphs,
        },
        runtime: {
            scene: {
                computed: {},
            },
        },
    });

    const left = evaluateSceneAnimation(makeSnapshot([graphA, graphB]), { frame: 0 });
    const right = evaluateSceneAnimation(makeSnapshot([graphB, graphA]), { frame: 0 });

    assert.deepEqual(left, right);
    assert.deepEqual(left, {
        'hand-bone': {
            x: 7,
        },
    });
});
