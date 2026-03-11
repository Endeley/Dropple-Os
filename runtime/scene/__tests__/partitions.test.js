import test from 'node:test';
import assert from 'node:assert/strict';

import {
    assignNodeToPartition,
    buildScenePartitions,
    collectDirtyPartitions,
    evaluateSceneIncremental,
} from '@/runtime/scene/index.js';

function createDocument() {
    return {
        sceneGraph: {
            rootIds: ['frameA', 'frameB'],
            nodes: {
                frameA: { id: 'frameA', children: ['a1', 'a2'] },
                a1: { id: 'a1', parentId: 'frameA', children: [] },
                a2: { id: 'a2', parentId: 'frameA', children: [] },
                frameB: { id: 'frameB', children: ['b1'] },
                b1: { id: 'b1', parentId: 'frameB', children: [] },
            },
        },
    };
}

test('buildScenePartitions creates deterministic root-subtree partitions', () => {
    const partitions = buildScenePartitions(createDocument());

    assert.deepEqual([...partitions.keys()], ['p0', 'p1']);
    assert.deepEqual([...partitions.get('p0').nodes].sort(), ['a1', 'a2', 'frameA']);
    assert.deepEqual([...partitions.get('p1').nodes].sort(), ['b1', 'frameB']);
});

test('assignNodeToPartition resolves nodes to their partition', () => {
    const scene = { partitions: buildScenePartitions(createDocument()) };

    assert.equal(assignNodeToPartition(scene, 'a2'), 'p0');
    assert.equal(assignNodeToPartition(scene, 'b1'), 'p1');
    assert.equal(assignNodeToPartition(scene, 'missing'), null);
});

test('collectDirtyPartitions marks only touched partitions', () => {
    const scene = { partitions: buildScenePartitions(createDocument()) };
    const dirty = collectDirtyPartitions(scene, new Set(['a1', 'a2']));

    assert.deepEqual([...dirty], ['p0']);
    assert.equal(scene.partitions.get('p0').dirty, true);
    assert.equal(scene.partitions.get('p1').dirty, false);
});

test('incremental evaluator caches partitions and invalidates them on structural change', () => {
    const runtime = {};
    const documentA = createDocument();

    evaluateSceneIncremental({
        event: { type: 'node/update', payload: { nodeId: 'frameA' } },
        document: documentA,
        runtime,
    });

    const firstPartitions = runtime.scene.partitions;
    assert.ok(firstPartitions instanceof Map);
    assert.equal(firstPartitions.size, 2);

    evaluateSceneIncremental({
        event: { type: 'node/update', payload: { nodeId: 'a1' } },
        document: documentA,
        runtime,
    });

    assert.equal(runtime.scene.partitions, firstPartitions);

    const documentB = {
        sceneGraph: {
            rootIds: ['frameA', 'frameB', 'frameC'],
            nodes: {
                ...documentA.sceneGraph.nodes,
                frameC: { id: 'frameC', children: [] },
            },
        },
    };

    evaluateSceneIncremental({
        event: { type: 'node/create', payload: { node: { id: 'frameC' } } },
        document: documentB,
        runtime,
    });

    assert.notEqual(runtime.scene.partitions, firstPartitions);
    assert.equal(runtime.scene.partitions.size, 3);
});
