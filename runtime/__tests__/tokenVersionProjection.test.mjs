import test from 'node:test';
import assert from 'node:assert/strict';

import { appendTokenVersion, rollbackTokenVersion } from '@/runtime/tokens/tokenVersionGraph.js';
import {
    hashProjectedTokenVersionGraph,
    projectTokenVersionGraph,
} from '@/runtime/tokens/projectTokenVersionGraph.js';
import { selectActiveTokenVersionGraph } from '@/runtime/tokens/selectActiveTokenVersionGraph.js';

function createLineageGraph() {
    return appendTokenVersion(
        appendTokenVersion(
            appendTokenVersion(
                appendTokenVersion(undefined, {
                    id: 'v1',
                    label: 'Initial',
                    timestamp: 1,
                }),
                {
                    id: 'v2',
                    label: 'Child',
                    parentVersionIds: ['v1'],
                    timestamp: 2,
                    operation: 'fork',
                },
            ),
            {
                id: 'v3',
                label: 'Merge',
                parentVersionIds: ['v1', 'v2'],
                timestamp: 3,
                operation: 'merge',
            },
        ),
        {
            id: 'v4',
            label: 'Branch Head',
            parentVersionIds: ['v1'],
            timestamp: 4,
            operation: 'fork',
        },
    );
}

test('token version projection stays identical under entry storage reordering', () => {
    const graph = createLineageGraph();
    const reorderedGraph = {
        ...graph,
        entries: {
            v4: graph.entries.v4,
            v2: graph.entries.v2,
            v1: graph.entries.v1,
            v3: graph.entries.v3,
        },
    };

    const projected = projectTokenVersionGraph(graph);
    const reordered = projectTokenVersionGraph(reorderedGraph);

    assert.deepEqual(reordered, projected);
    assert.equal(hashProjectedTokenVersionGraph(reordered), hashProjectedTokenVersionGraph(projected));
});

test('token version projection derives deterministic branch heads and merge nodes', () => {
    const projected = projectTokenVersionGraph(createLineageGraph());

    assert.deepEqual(projected.topoOrder, ['v1', 'v2', 'v3', 'v4']);
    assert.deepEqual(projected.branchHeads, ['v3', 'v4']);
    assert.deepEqual(projected.mergeNodes, ['v3']);
    assert.deepEqual(projected.edges, [
        { from: 'v1', to: 'v2', type: 'fork' },
        { from: 'v1', to: 'v3', type: 'merge' },
        { from: 'v1', to: 'v4', type: 'fork' },
        { from: 'v2', to: 'v3', type: 'merge' },
    ]);
});

test('token version projection resolves active head deterministically after rollback', () => {
    const rolledBack = rollbackTokenVersion(createLineageGraph(), 'v1');
    const projected = projectTokenVersionGraph(rolledBack);

    assert.equal(projected.activeHead, 'v1');
    assert.equal(projected.nodes.find((node) => node.id === 'v1')?.isActive, true);
    assert.equal(projected.nodes.find((node) => node.id === 'v4')?.isActive, false);
});

test('token version selector projects from canonical document truth only', () => {
    const graph = createLineageGraph();
    const projected = selectActiveTokenVersionGraph({
        document: {
            tokenVersions: graph,
        },
    });

    assert.equal(projected.activeHead, 'v4');
    assert.deepEqual(projected.branchHeads, ['v3', 'v4']);
});
