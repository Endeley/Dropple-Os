import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildDependencyGraph,
    buildEvaluationLayers,
    topologicalSort,
    evaluateSceneIncremental,
} from '@/runtime/scene/index.js';

test('dependency graph and topo order are deterministic', () => {
    const document = {
        sceneGraph: {
            nodes: {
                root: { id: 'root', children: ['b', 'a'] },
                a: { id: 'a', children: [] },
                b: { id: 'b', children: [] },
            },
        },
    };

    const graph = buildDependencyGraph(document);
    const orderA = topologicalSort(graph);
    const orderB = topologicalSort(graph);

    assert.deepEqual(orderA, ['a', 'b', 'root']);
    assert.deepEqual(orderB, orderA);
});

test('evaluation layers are deterministic and parent-first', () => {
    const document = {
        sceneGraph: {
            nodes: {
                root: { id: 'root', children: ['frameB', 'frameA'] },
                frameA: { id: 'frameA', parentId: 'root', children: ['rect2', 'rect1'] },
                frameB: { id: 'frameB', parentId: 'root', children: ['rect3'] },
                rect1: { id: 'rect1', parentId: 'frameA', children: [] },
                rect2: { id: 'rect2', parentId: 'frameA', children: [] },
                rect3: { id: 'rect3', parentId: 'frameB', children: [] },
            },
        },
    };

    const graph = buildDependencyGraph(document);
    const layersA = buildEvaluationLayers(graph);
    const layersB = buildEvaluationLayers(graph);

    assert.deepEqual(layersA, [
        ['root'],
        ['frameA', 'frameB'],
        ['rect1', 'rect2', 'rect3'],
    ]);
    assert.deepEqual(layersB, layersA);
});

test('incremental evaluator computes layout-root subtrees in deterministic order', () => {
    const document = {
        sceneGraph: {
            nodes: {
                root: { id: 'root', children: ['b', 'a'] },
                a: { id: 'a', children: [] },
                b: { id: 'b', children: [] },
            },
        },
    };

    const runtime = evaluateSceneIncremental({
        event: {
            type: 'node/update',
            payload: { nodeId: 'root' },
        },
        document,
        runtime: {},
    });

    assert.deepEqual(Object.keys(runtime.scene.computed).sort(), ['a', 'b', 'root']);
    assert.deepEqual(runtime.scene.computed.root.worldTransform, [1, 0, 0, 1, 0, 0]);
    assert.deepEqual(runtime.scene.computed.root.worldBounds, {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
});

test('incremental evaluator propagates transforms through parent chains including groups', () => {
    const document = {
        sceneGraph: {
            nodes: {
                root: {
                    id: 'root',
                    type: 'frame',
                    children: ['group'],
                    props: {
                        transform: { x: 100, y: 50 },
                    },
                },
                group: {
                    id: 'group',
                    type: 'group',
                    parentId: 'root',
                    children: ['child'],
                    props: {
                        transform: { x: 20, y: 10, rotation: 90 },
                    },
                },
                child: {
                    id: 'child',
                    type: 'rect',
                    parentId: 'group',
                    children: [],
                    props: {
                        transform: { x: 5, y: 0 },
                        size: { width: 10, height: 20 },
                    },
                },
            },
        },
    };

    const runtime = evaluateSceneIncremental({
        event: {
            type: 'node/update',
            payload: { nodeId: 'root' },
        },
        document,
        runtime: {},
    });

    assert.deepEqual(runtime.scene.computed.root.worldTransform, [1, 0, 0, 1, 100, 50]);
    assert.deepEqual(runtime.scene.computed.group.worldTransform, [0, 1, -1, 0, 120, 60]);
    assert.deepEqual(runtime.scene.computed.child.worldTransform, [0, 1, -1, 0, 120, 65]);
    assert.deepEqual(runtime.scene.computed.child.worldBounds, {
        x: 100,
        y: 65,
        width: 20,
        height: 10,
    });
});

test('incremental evaluator caches evaluation order and invalidates it on structural change', () => {
    const runtime = {};
    const documentA = {
        sceneGraph: {
            nodes: {
                root: { id: 'root', children: ['b', 'a'] },
                a: { id: 'a', parentId: 'root', children: [] },
                b: { id: 'b', parentId: 'root', children: [] },
            },
        },
    };

    evaluateSceneIncremental({
        event: {
            type: 'node/update',
            payload: { nodeId: 'root' },
        },
        document: documentA,
        runtime,
    });

    const firstOrder = runtime.scene.evaluationOrder;
    const firstLayers = runtime.scene.evaluationLayers;
    assert.deepEqual(firstOrder, ['a', 'b', 'root']);
    assert.deepEqual(firstLayers, [['root'], ['a', 'b']]);

    evaluateSceneIncremental({
        event: {
            type: 'node/update',
            payload: { nodeId: 'a' },
        },
        document: documentA,
        runtime,
    });

    assert.equal(runtime.scene.evaluationOrder, firstOrder);
    assert.equal(runtime.scene.evaluationLayers, firstLayers);

    const documentB = {
        sceneGraph: {
            nodes: {
                root: { id: 'root', children: ['b', 'a', 'c'] },
                a: { id: 'a', parentId: 'root', children: [] },
                b: { id: 'b', parentId: 'root', children: [] },
                c: { id: 'c', parentId: 'root', children: [] },
            },
        },
    };

    evaluateSceneIncremental({
        event: {
            type: 'node/create',
            payload: { node: { id: 'c', parentId: 'root' } },
        },
        document: documentB,
        runtime,
    });

    assert.notEqual(runtime.scene.evaluationOrder, firstOrder);
    assert.notEqual(runtime.scene.evaluationLayers, firstLayers);
    assert.deepEqual(runtime.scene.evaluationOrder, ['a', 'b', 'c', 'root']);
    assert.deepEqual(runtime.scene.evaluationLayers, [['root'], ['a', 'b', 'c']]);
});

test('incremental evaluator applies runtime animation transforms into scene computed output', () => {
    const document = {
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
                        childNode: 'child',
                    },
                },
            },
        ],
        motion: {
            'hand-node': {
                x: { keyframes: [{ frame: 0, value: 50 }] },
                y: { keyframes: [{ frame: 0, value: 80 }] },
                rotation: { keyframes: [{ frame: 0, value: 0 }] },
            },
        },
        sceneGraph: {
            nodes: {
                root: { id: 'root', children: ['child'] },
                child: {
                    id: 'child',
                    parentId: 'root',
                    children: [],
                    props: {
                        size: { width: 10, height: 10 },
                    },
                },
            },
        },
    };

    const runtime = evaluateSceneIncremental({
        event: {
            type: 'clock/seek',
            payload: { time: 0 },
        },
        document,
        runtime: {
            playback: {
                frame: 0,
            },
        },
    });

    assert.deepEqual(runtime.scene.computed.transforms, {
        child: {
            x: 50,
            y: 80,
            rotation: 0,
        },
    });
    assert.deepEqual(runtime.scene.computed.child.worldTransform, [1, 0, 0, 1, 50, 80]);
});

test('incremental evaluator stores canonical temporal context on runtime scene', () => {
    const document = {
        sceneGraph: {
            activeSceneId: 'scene-1',
            rootIds: ['root'],
            nodes: {
                root: {
                    id: 'root',
                    type: 'frame',
                    children: [],
                    props: { transform: { x: 0, y: 0, rotation: 0 } },
                },
            },
            scenes: [
                {
                    id: 'scene-1',
                    shots: [{ id: 'shot-a', start: 0, duration: 1000 }],
                },
            ],
        },
        sequences: {
            sequences: {
                seqA: {
                    id: 'seqA',
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
                                    end: 24,
                                    cameraNodeRef: 'camera-a',
                                },
                            },
                        },
                    },
                },
            },
            activeSequenceId: 'seqA',
        },
    };
    const runtime = {
        playback: {
            frame: 12,
            timeMs: 500,
        },
        scene: {
            activeSceneId: 'scene-1',
            activeShotId: null,
            camera: null,
            computed: {},
            transformDirty: new Set(),
            layoutDirty: new Set(),
            paintDirty: new Set(),
            indexDirty: new Set(),
            layoutRoots: new Map(),
            dependencyGraph: null,
            spatialIndex: null,
        },
    };

    evaluateSceneIncremental({
        event: { type: 'clock/seek', payload: { time: 12 } },
        document,
        runtime,
    });

    assert.equal(runtime.scene.temporalContext.sequenceId, 'seqA');
    assert.equal(runtime.scene.temporalContext.activeShot.shotId, 'shot-a');
    assert.equal(runtime.scene.temporalContext.activeCamera.cameraNodeRef, 'camera-a');
    assert.equal(runtime.scene.activeShotId, 'shot-a');
    assert.equal(runtime.scene.camera.source, 'sequence');
    assert.equal(runtime.scene.camera.nodeRef, 'camera-a');
});
