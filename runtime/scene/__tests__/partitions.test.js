import test from 'node:test';
import assert from 'node:assert/strict';

import {
    assignNodeToPartition,
    buildScenePartitions,
    collectVisiblePartitions,
    collectDirtyPartitions,
    evaluateSceneIncremental,
    updatePartitionBounds,
} from '@/runtime/scene/index.js';
import { createCanonicalDocumentEnvelope } from '@/core/persistence/documentEnvelope.js';

function createDocument() {
    const document = createCanonicalDocumentEnvelope();
    document.sceneGraph = {
        rootIds: ['frameA', 'frameB'],
        nodes: {
            frameA: { id: 'frameA', children: ['a1', 'a2'] },
            a1: { id: 'a1', parentId: 'frameA', children: [] },
            a2: { id: 'a2', parentId: 'frameA', children: [] },
            frameB: { id: 'frameB', children: ['b1'] },
            b1: { id: 'b1', parentId: 'frameB', children: [] },
        },
    };
    return document;
}

test('buildScenePartitions creates deterministic root-subtree partitions', () => {
    const { partitions, nodeToPartition } = buildScenePartitions(createDocument());

    assert.deepEqual([...partitions.keys()], ['p0', 'p1']);
    assert.deepEqual([...partitions.get('p0').nodes].sort(), ['a1', 'a2', 'frameA']);
    assert.deepEqual([...partitions.get('p1').nodes].sort(), ['b1', 'frameB']);
    assert.equal(nodeToPartition.get('a1'), 'p0');
    assert.equal(nodeToPartition.get('b1'), 'p1');
});

test('assignNodeToPartition resolves nodes to their partition', () => {
    const partitionData = buildScenePartitions(createDocument());
    const scene = {
        partitions: partitionData.partitions,
        nodeToPartition: partitionData.nodeToPartition,
    };

    assert.equal(assignNodeToPartition(scene, 'a2'), 'p0');
    assert.equal(assignNodeToPartition(scene, 'b1'), 'p1');
    assert.equal(assignNodeToPartition(scene, 'missing'), null);
});

test('collectDirtyPartitions marks only touched partitions', () => {
    const partitionData = buildScenePartitions(createDocument());
    const scene = {
        partitions: partitionData.partitions,
        nodeToPartition: partitionData.nodeToPartition,
    };
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
    const firstNodeToPartition = runtime.scene.nodeToPartition;
    assert.ok(firstPartitions instanceof Map);
    assert.equal(firstPartitions.size, 2);

    evaluateSceneIncremental({
        event: { type: 'node/update', payload: { nodeId: 'a1' } },
        document: documentA,
        runtime,
    });

    assert.equal(runtime.scene.partitions, firstPartitions);
    assert.equal(runtime.scene.nodeToPartition, firstNodeToPartition);

    const documentB = createCanonicalDocumentEnvelope();
    documentB.sceneGraph = {
        rootIds: ['frameA', 'frameB', 'frameC'],
        nodes: {
            ...documentA.sceneGraph.nodes,
            frameC: { id: 'frameC', children: [] },
        },
    };

    evaluateSceneIncremental({
        event: { type: 'node/create', payload: { node: { id: 'frameC' } } },
        document: documentB,
        runtime,
    });

    assert.notEqual(runtime.scene.partitions, firstPartitions);
    assert.notEqual(runtime.scene.nodeToPartition, firstNodeToPartition);
    assert.equal(runtime.scene.partitions.size, 3);
});

test('updatePartitionBounds derives bounds from computed geometry', () => {
    const scene = {
        computed: {
            frameA: { worldBounds: { x: 0, y: 0, width: 20, height: 20 } },
            a1: { worldBounds: { x: 40, y: 10, width: 10, height: 10 } },
            a2: { worldBounds: { x: 20, y: 20, width: 10, height: 10 } },
        },
        partitions: new Map([
            [
                'p0',
                {
                    id: 'p0',
                    nodes: new Set(['frameA', 'a1', 'a2']),
                    bounds: null,
                    visible: true,
                    dirty: false,
                },
            ],
        ]),
    };

    updatePartitionBounds(scene);

    assert.deepEqual(scene.partitions.get('p0').bounds, {
        x: 0,
        y: 0,
        width: 50,
        height: 30,
    });
});

test('collectVisiblePartitions marks visible partitions from viewport bounds', () => {
    const scene = {
        partitions: new Map([
            ['p0', { id: 'p0', bounds: { x: 0, y: 0, width: 50, height: 50 }, visible: true }],
            ['p1', { id: 'p1', bounds: { x: 500, y: 500, width: 50, height: 50 }, visible: true }],
            ['p2', { id: 'p2', bounds: null, visible: true }],
        ]),
    };

    const visible = collectVisiblePartitions(scene, {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
    });

    assert.deepEqual([...visible].sort(), ['p0', 'p2']);
    assert.equal(scene.partitions.get('p0').visible, true);
    assert.equal(scene.partitions.get('p1').visible, false);
    assert.equal(scene.partitions.get('p2').visible, true);
});
