import test from 'node:test';
import assert from 'node:assert/strict';

import {
    selectActiveGraph,
    selectActiveGraphId,
    selectGraphEdges,
    selectGraphNodes,
    selectGraphs,
} from '../graphSelectors.js';

test('graph selectors resolve deterministic active graph from object-backed graphs', () => {
    const state = {
        document: {
            graphs: {
                b: {
                    id: 'b',
                    nodes: {
                        value: { id: 'value', type: 'value', position: { x: 10, y: 20 } },
                    },
                    output: 'value',
                },
                a: {
                    id: 'a',
                    nodes: {
                        noise: { id: 'noise', type: 'noise', position: { x: 20, y: 40 } },
                    },
                    output: 'noise',
                },
            },
        },
    };

    const graphs = selectGraphs(state);
    assert.deepEqual(
        graphs.map((graph) => graph.id),
        ['a', 'b'],
    );
    assert.equal(selectActiveGraphId(state), 'a');
    assert.equal(selectActiveGraph(state)?.id, 'a');
});

test('graph selectors project nodes and edges from legacy dependency fields', () => {
    const state = {
        document: {
            graphs: [
                {
                    id: 'graphA',
                    nodes: [
                        { id: 'value', type: 'value', position: { x: 0, y: 0 } },
                        { id: 'noise', type: 'noise', input: 'value', position: { x: 100, y: 100 } },
                    ],
                    output: 'noise',
                },
            ],
        },
    };

    const nodes = selectGraphNodes(state);
    const edges = selectGraphEdges(state);

    assert.equal(nodes.length, 2);
    assert.equal(edges.length, 1);
    assert.deepEqual(edges[0], {
        id: 'value:noise:input',
        from: 'value',
        to: 'noise',
        input: 'input',
    });
});

test('graph selectors respect explicit active graph id when present', () => {
    const state = {
        animation: {
            activeGraphId: 'graphB',
        },
        document: {
            graphs: [
                { id: 'graphA', nodes: [{ id: 'a', type: 'value' }], output: 'a' },
                { id: 'graphB', nodes: [{ id: 'b', type: 'value' }], output: 'b' },
            ],
        },
    };

    assert.equal(selectActiveGraphId(state), 'graphB');
    assert.equal(selectActiveGraph(state)?.id, 'graphB');
});
