import test from 'node:test';
import assert from 'node:assert/strict';

import { blendChannelValues } from '../blending/blendChannels.js';
import { blendAnimationLayers } from '../blending/blendLayers.js';
import { evaluateAnimationBlend } from '../blending/blendEngine.js';
import { evaluateAnimationFrame } from '../evaluateAnimationFrame.js';

test('blendChannelValues blends replace, add, multiply, and override deterministically', () => {
    const result = blendChannelValues([
        { mode: 'replace', value: 10, weight: 1 },
        { mode: 'add', value: 5, weight: 0.5 },
        { mode: 'multiply', value: 0.2, weight: 1 },
        { mode: 'override', value: 8, weight: 0.25 },
    ]);

    assert.equal(result, 13.25);
});

test('blendAnimationLayers produces a stable blended channel map', () => {
    const result = blendAnimationLayers([
        {
            id: 'walk',
            mode: 'replace',
            weight: 1,
            channels: [
                { controllerId: 'arm_CTRL', channel: 'rotateX', value: 20 },
                { controllerId: 'head_CTRL', channel: 'rotateY', value: 10 },
            ],
        },
        {
            id: 'aim',
            mode: 'add',
            weight: 0.5,
            channels: [
                { controllerId: 'arm_CTRL', channel: 'rotateX', value: 30 },
            ],
        },
    ]);

    assert.deepEqual(result, {
        'arm_CTRL:rotateX': 35,
        'head_CTRL:rotateY': 10,
    });
});

test('evaluateAnimationBlend sorts clips deterministically before blending', () => {
    const left = evaluateAnimationBlend({
        timelineClips: [
            {
                id: 'b',
                mode: 'add',
                weight: 0.5,
                channels: [{ controllerId: 'arm_CTRL', channel: 'rotateX', value: 30 }],
            },
            {
                id: 'a',
                mode: 'replace',
                weight: 1,
                channels: [{ controllerId: 'arm_CTRL', channel: 'rotateX', value: 20 }],
            },
        ],
        stateMachineClips: [],
    });

    const right = evaluateAnimationBlend({
        timelineClips: [
            {
                id: 'a',
                mode: 'replace',
                weight: 1,
                channels: [{ controllerId: 'arm_CTRL', channel: 'rotateX', value: 20 }],
            },
            {
                id: 'b',
                mode: 'add',
                weight: 0.5,
                channels: [{ controllerId: 'arm_CTRL', channel: 'rotateX', value: 30 }],
            },
        ],
        stateMachineClips: [],
    });

    assert.deepEqual(left, right);
    assert.equal(left['arm_CTRL:rotateX'], 35);
});

test('evaluateAnimationFrame returns blended channels and rig-ready controller values', () => {
    const result = evaluateAnimationFrame({
        snapshot: {
            frame: 20,
            document: {
                choreography: {
                    scenes: [
                        {
                            id: 'fightScene1',
                            participants: [
                                { id: 'hero', rigId: 'heroRig' },
                                { id: 'enemy', rigId: 'enemyRig' },
                            ],
                            beats: [
                                {
                                    id: 'beat1',
                                    time: 20,
                                    action: 'sword_slash',
                                    attacker: 'hero',
                                    target: 'enemy',
                                    reaction: 'stagger',
                                },
                            ],
                        },
                    ],
                },
            },
        },
        animation: {
            timelineClips: [
                {
                    id: 'walk',
                    mode: 'replace',
                    weight: 1,
                    channels: [
                        { controllerId: 'arm_CTRL', channel: 'rotateX', value: 20 },
                        { controllerId: 'head_CTRL', channel: 'rotateY', value: 12 },
                    ],
                },
            ],
            stateClips: [
                {
                    id: 'shoot',
                    mode: 'add',
                    weight: 0.5,
                    channels: [
                        { controllerId: 'arm_CTRL', channel: 'rotateX', value: 30 },
                    ],
                },
            ],
        },
    });

    assert.deepEqual(result.blendedChannels, {
        'arm_CTRL:rotateX': 35,
        'arm_R_CTRL:rotateX': 70,
        'head_CTRL:rotateY': 12,
        'spine_CTRL:rotateZ': 0,
    });
    assert.deepEqual(result.controllerValues, {
        arm_CTRL: {
            rotateX: 35,
        },
        arm_R_CTRL: {
            rotateX: 70,
        },
        head_CTRL: {
            rotateY: 12,
        },
        spine_CTRL: {
            rotateZ: 0,
        },
    });
    assert.equal(result.choreographyClips.length, 2);
});
