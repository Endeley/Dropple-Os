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

test('incremental evaluator only computes dirty nodes in deterministic order', () => {
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

    assert.deepEqual(Object.keys(runtime.computed), ['root']);
    assert.deepEqual(runtime.computed.root, {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
});
