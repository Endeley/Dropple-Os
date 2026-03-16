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
