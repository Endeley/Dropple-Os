import test from 'node:test';
import assert from 'node:assert/strict';

import { generateCombatAnimation } from '../generateCombatAnimation.js';
import { evaluateChoreography } from '../evaluateChoreography.js';

test('generateCombatAnimation creates deterministic attack and reaction clips', () => {
    const clips = generateCombatAnimation(
        {
            id: 'beat1',
            time: 20,
            action: 'sword_slash',
            attacker: 'hero',
            target: 'enemy',
            reaction: 'stagger',
        },
        {
            participants: {
                hero: { id: 'hero', rigId: 'heroRig' },
                enemy: { id: 'enemy', rigId: 'enemyRig' },
            },
        }
    );

    assert.equal(clips.length, 2);
    assert.equal(clips[0].rigId, 'heroRig');
    assert.equal(clips[0].startFrame, 0);
    assert.equal(clips[1].rigId, 'enemyRig');
    assert.equal(clips[1].startFrame, 20);
});

test('evaluateChoreography samples active generated clips at the current frame', () => {
    const result = evaluateChoreography({
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
    });

    assert.equal(result.length, 2);
    assert.deepEqual(result[0], {
        id: 'beat1:attack',
        rigId: 'heroRig',
        participantId: 'hero',
        mode: 'replace',
        weight: 1,
        startFrame: 0,
        duration: 20,
        channels: [
            {
                controllerId: 'arm_R_CTRL',
                channel: 'rotateX',
                value: 70,
            },
        ],
    });
    assert.deepEqual(result[1], {
        id: 'beat1:reaction',
        rigId: 'enemyRig',
        participantId: 'enemy',
        mode: 'replace',
        weight: 1,
        startFrame: 20,
        duration: 15,
        channels: [
            {
                controllerId: 'spine_CTRL',
                channel: 'rotateZ',
                value: 0,
            },
        ],
    });
});

