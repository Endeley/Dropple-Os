import test from 'node:test';
import assert from 'node:assert/strict';

import {
    getNodeDependencies,
    validateGraph,
} from '../graph/graphValidation.js';

test('getNodeDependencies returns supported animation graph edges in stable order', () => {
    assert.deepEqual(
        getNodeDependencies({
            id: 'blend',
            input: 'speed',
            a: 'idle',
            b: 'walk',
        }),
        ['speed', 'idle', 'walk']
    );
});

test('validateGraph accepts a valid DAG rooted at output', () => {
    const result = validateGraph({
        id: 'characterGraph',
        nodes: [
            { id: 'idle', type: 'clip' },
            { id: 'walk', type: 'clip' },
            { id: 'blend', type: 'blend', a: 'idle', b: 'walk' },
        ],
        output: 'blend',
    });

    assert.equal(result.id, 'characterGraph');
    assert.equal(result.output, 'blend');
    assert.deepEqual(result.visited.sort(), ['blend', 'idle', 'walk']);
});

test('validateGraph throws when a dependency is missing', () => {
    assert.throws(
        () =>
            validateGraph({
                id: 'characterGraph',
                nodes: [{ id: 'blend', type: 'blend', a: 'idle' }],
                output: 'blend',
            }),
        /Missing graph node idle/
    );
});

test('validateGraph throws when the graph contains a cycle', () => {
    assert.throws(
        () =>
            validateGraph({
                id: 'characterGraph',
                nodes: [
                    { id: 'a', type: 'blend', input: 'b' },
                    { id: 'b', type: 'blend', input: 'a' },
                ],
                output: 'a',
            }),
        /Animation graph cycle detected/
    );
});

test('validateGraph throws when the graph is missing an output node', () => {
    assert.throws(
        () =>
            validateGraph({
                id: 'characterGraph',
                nodes: [{ id: 'idle', type: 'clip' }],
            }),
        /Animation graph missing output node/
    );
});

test('validateGraph supports multiple output roots and inputs arrays', () => {
    const result = validateGraph({
        id: 'characterGraph',
        nodes: [
            { id: 'speed', type: 'input' },
            { id: 'idle', type: 'clip' },
            { id: 'walk', type: 'clip' },
            { id: 'chooser', type: 'blend', inputs: ['speed', 'idle', 'walk'] },
        ],
        output: ['chooser', 'walk'],
    });

    assert.deepEqual(result.outputRoots, ['chooser', 'walk']);
});

test('validateGraph throws when graph id is missing', () => {
    assert.throws(
        () =>
            validateGraph({
                nodes: [{ id: 'idle', type: 'clip' }],
                output: 'idle',
            }),
        /Animation graph is missing id/
    );
});

test('validateGraph throws when node ids are duplicated', () => {
    assert.throws(
        () =>
            validateGraph({
                id: 'characterGraph',
                nodes: [
                    { id: 'idle', type: 'clip' },
                    { id: 'idle', type: 'clip' },
                ],
                output: 'idle',
            }),
        /Duplicate animation graph node id: idle/
    );
});

test('validateGraph rejects invalid graph parameter definitions', () => {
    assert.throws(
        () =>
            validateGraph({
                id: 'characterGraph',
                parameters: {
                    speed: { type: 'vector' },
                },
                nodes: [{ id: 'idle', type: 'clip' }],
                output: 'idle',
            }),
        /Parameter "speed" has unsupported type "vector"/
    );
});
