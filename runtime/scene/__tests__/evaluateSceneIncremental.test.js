import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildDependencyGraph,
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
    assert.deepEqual(firstOrder, ['a', 'b', 'root']);

    evaluateSceneIncremental({
        event: {
            type: 'node/update',
            payload: { nodeId: 'a' },
        },
        document: documentA,
        runtime,
    });

    assert.equal(runtime.scene.evaluationOrder, firstOrder);

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
    assert.deepEqual(runtime.scene.evaluationOrder, ['a', 'b', 'c', 'root']);
});
