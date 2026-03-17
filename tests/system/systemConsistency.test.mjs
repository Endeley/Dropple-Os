import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateGraphs } from '@/runtime/animation/graph/graphRuntime.js';
import { evaluateAnimationFrame } from '@/runtime/animation/evaluateAnimationFrame.js';
import { evaluateSceneAnimation } from '@/runtime/animation/evaluateSceneAnimation.js';
import { evaluateSceneIncremental } from '@/runtime/scene/evaluateSceneIncremental.js';
import { rotationMatrix, translationMatrix, multiplyMatrix } from '@/runtime/math/matrix2d.js';

function createConsistencyDocument() {
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
                        channels: ['x', 'rotation'],
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
                    keyframes: [{ frame: 10, value: 10 }],
                },
            },
        },
        graphs: [
            {
                id: 'graph1',
                rigId: 'heroRig',
                nodes: [
                    {
                        id: 'v1',
                        type: 'value',
                        controllerId: 'ctrl-hand',
                        channel: 'rotation',
                        value: 10,
                    },
                ],
                output: 'v1',
            },
        ],
        choreography: {},
        stateMachines: {},
    };
}

function sanitizeScene(scene) {
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

test('system consistency: graph, blend, and scene layers agree on stable final transforms', () => {
    const document = createConsistencyDocument();
    const before = JSON.stringify(document);

    const graphLayersA = evaluateGraphs(
        {
            document,
            runtime: {},
            frame: 10,
        },
        { frame: 10 }
    );
    const graphLayersB = evaluateGraphs(
        {
            document,
            runtime: {},
            frame: 10,
        },
        { frame: 10 }
    );

    assert.deepEqual(graphLayersA, graphLayersB);
    assert.equal(graphLayersA[0].channels[0].value, 10);

    const animationFrameA = evaluateAnimationFrame({
        snapshot: {
            document,
            frame: 10,
        },
        rigId: 'heroRig',
        animation: {
            timelineClips: graphLayersA,
            stateMachineClips: [],
        },
    });
    const animationFrameB = evaluateAnimationFrame({
        snapshot: {
            document,
            frame: 10,
        },
        rigId: 'heroRig',
        animation: {
            timelineClips: graphLayersB,
            stateMachineClips: [],
        },
    });

    assert.deepEqual(animationFrameA, animationFrameB);
    assert.deepEqual(animationFrameA.controllerValues, {
        'ctrl-hand': {
            rotation: 10,
        },
    });

    const sceneAnimationA = evaluateSceneAnimation(
        {
            document,
            frame: 10,
            runtime: {
                scene: {
                    computed: {},
                },
            },
        },
        { frame: 10 }
    );
    const sceneAnimationB = evaluateSceneAnimation(
        {
            document,
            frame: 10,
            runtime: {
                scene: {
                    computed: {},
                },
            },
        },
        { frame: 10 }
    );

    assert.deepEqual(sceneAnimationA, sceneAnimationB);
    assert.deepEqual(sceneAnimationA, {
        'hand-bone': {
            x: 10,
            rotation: 10,
        },
    });

    const runtimeA = evaluateSceneIncremental({
        event: {
            type: 'clock/seek',
            payload: { time: 10 },
        },
        document,
        runtime: {
            playback: {
                frame: 10,
            },
        },
    });
    const runtimeB = evaluateSceneIncremental({
        event: {
            type: 'clock/seek',
            payload: { time: 10 },
        },
        document,
        runtime: {
            playback: {
                frame: 10,
            },
        },
    });

    assert.deepEqual(sanitizeScene(runtimeA.scene), sanitizeScene(runtimeB.scene));
    assert.deepEqual(runtimeA.scene.computed.transforms, {
        'hand-bone': {
            x: 10,
            rotation: 10,
        },
    });
    assert.deepEqual(
        runtimeA.scene.computed['hand-bone'].worldTransform,
        multiplyMatrix(translationMatrix(10, 0), rotationMatrix(10))
    );
    assert.equal(JSON.stringify(document), before);
});
