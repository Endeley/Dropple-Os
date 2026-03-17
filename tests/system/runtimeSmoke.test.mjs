import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateStateMachine } from '@/runtime/stateMachines/evaluation/evaluateStateMachine.js';
import { projectActiveSequenceView } from '@/runtime/projection/selectors/sequenceSelectors.js';
import { evaluateGraphs } from '@/runtime/animation/graph/graphRuntime.js';
import { evaluateAnimationFrame } from '@/runtime/animation/evaluateAnimationFrame.js';
import { evaluateSceneAnimation } from '@/runtime/animation/evaluateSceneAnimation.js';
import { evaluateSceneIncremental } from '@/runtime/scene/evaluateSceneIncremental.js';

function createDocument() {
    return {
        sceneGraph: {
            rootIds: ['root'],
            nodes: {
                root: {
                    id: 'root',
                    type: 'frame',
                    children: ['hand-bone'],
                    props: {
                        transform: { x: 0, y: 0, rotation: 0 },
                    },
                },
                'hand-bone': {
                    id: 'hand-bone',
                    type: 'rect',
                    parentId: 'root',
                    children: [],
                    props: {
                        transform: { x: 0, y: 0, rotation: 0 },
                        size: { width: 10, height: 10 },
                    },
                },
            },
        },
        rigs: [
            {
                id: 'heroRig',
                controllers: [
                    {
                        id: 'ctrl-hand',
                        nodeId: 'hand-driver',
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
            'hand-driver': {
                x: {
                    keyframes: [
                        { frame: 0, value: 10 },
                        { frame: 10, value: 30 },
                    ],
                },
                y: {
                    keyframes: [
                        { frame: 0, value: 20 },
                        { frame: 10, value: 40 },
                    ],
                },
            },
        },
        graphs: [
            {
                id: 'heroGraph',
                rigId: 'heroRig',
                nodes: [
                    {
                        id: 'aimParam',
                        type: 'parameter',
                        name: 'aim',
                        default: 0,
                        controllerId: 'ctrl-hand',
                        channel: 'rotation',
                    },
                ],
                output: 'aimParam',
            },
        ],
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
        sequences: {
            sequences: {
                seq1: {
                    id: 'seq1',
                    frameRate: 24,
                    tracks: {
                        cam: {
                            id: 'cam',
                            type: 'camera',
                            order: 0,
                            clips: {
                                clip1: {
                                    id: 'clip1',
                                    start: 0,
                                    end: 48,
                                    cameraNodeRef: 'camera-node',
                                },
                            },
                        },
                    },
                },
            },
            activeSequenceId: 'seq1',
        },
    };
}

function sanitizeComputed(scene) {
    return {
        transforms: scene?.computed?.transforms ?? {},
        handBone: scene?.computed?.['hand-bone']
            ? {
                  worldTransform: scene.computed['hand-bone'].worldTransform,
                  worldBounds: scene.computed['hand-bone'].worldBounds,
              }
            : null,
    };
}

test('runtime smoke executes the animation stack deterministically without mutating the document', () => {
    const document = createDocument();
    const documentBefore = JSON.stringify(document);

    const sequenceView = projectActiveSequenceView(document, { frame: 12 });
    assert.equal(sequenceView.sequenceId, 'seq1');
    assert.equal(sequenceView.activeCamera?.cameraNodeRef, 'camera-node');

    const stateMachine = {
        id: 'heroStateMachine',
        entryState: 'idle',
        parameters: { moving: true },
        states: [
            { id: 'idle', animationRef: 'idle_clip' },
            { id: 'walk', animationRef: 'walk_clip' },
        ],
        transitions: [
            {
                from: 'idle',
                to: 'walk',
                condition: { parameter: 'moving', operator: 'truthy' },
                blendDuration: 6,
            },
        ],
    };

    const machineEval = evaluateStateMachine(stateMachine, {
        activeStateId: 'idle',
        parameters: { moving: true },
    });
    assert.equal(machineEval.activeStateId, 'walk');
    assert.equal(machineEval.activeClips[0].clipRef, 'walk_clip');

    const graphRuntime = {};
    const graphLayers = evaluateGraphs(
        {
            document,
            runtime: graphRuntime,
            frame: 5,
        },
        {
            frame: 5,
            parameters: { aim: 15 },
        }
    );
    assert.equal(graphLayers.length, 1);
    assert.equal(graphLayers[0].channels[0].value, 15);

    const animationFrame = evaluateAnimationFrame({
        snapshot: {
            document,
            frame: 20,
        },
        rigId: 'heroRig',
        animation: {
            timelineClips: graphLayers,
            stateMachineClips: [],
        },
    });
    assert.equal(animationFrame.controllerValues['ctrl-hand'].rotation, 15);
    assert.equal(animationFrame.choreographyClips.length, 1);

    const sceneAnimation = evaluateSceneAnimation(
        {
            document,
            frame: 5,
            runtime: {
                scene: {
                    computed: {},
                },
            },
        },
        {
            frame: 5,
            parameters: { aim: 15 },
        }
    );
    assert.deepEqual(sceneAnimation, {
        'hand-bone': {
            x: 20,
            y: 30,
            rotation: 15,
        },
    });

    const runtimeA = evaluateSceneIncremental({
        event: {
            type: 'clock/seek',
            payload: { time: 5 },
        },
        document,
        runtime: {
            playback: {
                frame: 5,
            },
        },
    });

    const runtimeB = evaluateSceneIncremental({
        event: {
            type: 'clock/seek',
            payload: { time: 5 },
        },
        document,
        runtime: {
            playback: {
                frame: 5,
            },
        },
    });

    assert.deepEqual(
        sanitizeComputed(runtimeA.scene),
        sanitizeComputed(runtimeB.scene)
    );
    assert.deepEqual(runtimeA.scene.computed.transforms, {
        'hand-bone': {
            x: 20,
            y: 30,
            rotation: 0,
        },
    });
    assert.deepEqual(runtimeA.scene.computed['hand-bone'].worldTransform, [1, 0, 0, 1, 20, 30]);
    assert.equal(JSON.stringify(document), documentBefore);
});
