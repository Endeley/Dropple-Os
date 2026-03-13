import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildSegmentGraph,
    buildSegments,
    evaluateNode,
    evaluateSegment,
    frontierSegmentSchedule,
    schedulePartitions,
} from '@/runtime/scene/index.js';
import { createCanonicalDocumentEnvelope } from '@/core/persistence/documentEnvelope.js';

function createDocument() {
    const document = createCanonicalDocumentEnvelope();
    document.sceneGraph = {
        rootIds: ['root'],
        nodes: {
            root: {
                id: 'root',
                children: ['a', 'b'],
                props: { transform: { x: 10, y: 20 } },
            },
            a: {
                id: 'a',
                parentId: 'root',
                children: [],
                props: { transform: { x: 5, y: 0 }, size: { width: 10, height: 10 } },
            },
            b: {
                id: 'b',
                parentId: 'root',
                children: [],
                props: { transform: { x: 0, y: 7 }, size: { width: 20, height: 10 } },
            },
        },
    };
    return document;
}

test('evaluateSegment evaluates nodes in segment order and returns results', () => {
    const runtime = { scene: { computed: {} } };
    const results = evaluateSegment({
        segment: { id: 's0', nodes: ['root', 'a'] },
        evaluateNode,
        document: createDocument(),
        runtime,
    });

    assert.deepEqual(Object.keys(results), ['root', 'a']);
    assert.deepEqual(results.root.worldTransform, [1, 0, 0, 1, 10, 20]);
    assert.deepEqual(results.a.worldTransform, [1, 0, 0, 1, 15, 20]);
});

test('buildSegments compresses linear chains deterministically', () => {
    const graph = new Map([
        ['root', ['a']],
        ['a', ['b']],
        ['b', []],
        ['side', []],
    ]);

    const { segments, nodeToSegment } = buildSegments(graph);

    assert.deepEqual(
        [...segments.values()].map((segment) => segment.nodes),
        [['root', 'a', 'b'], ['side']],
    );
    assert.equal(nodeToSegment.get('root'), 's0');
    assert.equal(nodeToSegment.get('b'), 's0');
    assert.equal(nodeToSegment.get('side'), 's1');
});

test('frontierSegmentSchedule discovers only reachable affected segments within allowed set', () => {
    const graph = new Map([
        ['s0', ['s1', 's2']],
        ['s1', ['s3']],
        ['s2', []],
        ['s3', []],
    ]);
    const nodeToSegment = new Map([
        ['a', 's1'],
        ['c', 's3'],
    ]);

    const affected = frontierSegmentSchedule({
        dirtyNodes: new Set(['a']),
        nodeToSegment,
        segmentGraph: graph,
        allowedSegments: new Set(['s1', 's3']),
    });

    assert.deepEqual([...affected].sort(), ['s1', 's3']);
});

test('buildSegmentGraph preserves cross-segment dependencies', () => {
    const graph = new Map([
        ['root', ['a', 'b']],
        ['a', []],
        ['b', []],
    ]);
    const nodeToSegment = new Map([
        ['root', 's0'],
        ['a', 's1'],
        ['b', 's2'],
    ]);

    const segmentGraph = buildSegmentGraph(graph, nodeToSegment);

    assert.deepEqual([...segmentGraph.get('s0')].sort(), ['s1', 's2']);
});

test('schedulePartitions merges partition results deterministically', () => {
    const runtime = { scene: { computed: {} } };
    const segments = new Map([
        ['s0', { id: 's0', nodes: ['root'] }],
        ['s1', { id: 's1', nodes: ['a'] }],
        ['s2', { id: 's2', nodes: ['b'] }],
    ]);
    const nodeToSegment = new Map([
        ['root', 's0'],
        ['a', 's1'],
        ['b', 's2'],
    ]);
    const segmentGraph = new Map([
        ['s0', new Set(['s1', 's2'])],
        ['s1', new Set()],
        ['s2', new Set()],
    ]);
    const results = schedulePartitions({
        partitions: [
            { id: 'p0', nodes: new Set(['root', 'a']) },
            { id: 'p1', nodes: new Set(['b']) },
        ],
        layers: [['root'], ['a', 'b']],
        dirtyNodes: new Set(['root', 'a', 'b']),
        segments,
        nodeToSegment,
        segmentGraph,
        document: createDocument(),
        runtime,
    });

    assert.deepEqual(Object.keys(results).sort(), ['a', 'b', 'root']);
    assert.deepEqual(results.b.worldTransform, [1, 0, 0, 1, 10, 27]);
});
