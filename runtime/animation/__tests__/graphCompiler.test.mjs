import test from 'node:test';
import assert from 'node:assert/strict';

import { compileGraph } from '../graph/graphCompiler.js';

test('compileGraph builds deterministic topological order and blend-layer contract', () => {
    const compiled = compileGraph({
        id: 'characterGraph',
        nodes: [
            { id: 'idle', type: 'clip' },
            { id: 'walk', type: 'clip' },
            { id: 'blend', type: 'blend', a: 'idle', b: 'walk' },
        ],
        output: 'blend',
    });

    assert.equal(compiled.id, 'characterGraph');
    assert.deepEqual(compiled.order, ['idle', 'walk', 'blend']);
    assert.equal(compiled.output.kind, 'node');
    assert.equal(compiled.output.nodeId, 'blend');
    assert.equal(compiled.contract.type, 'blend-layers');
    assert.equal(compiled.nodeMap.get('blend').type, 'blend');
});

test('compileGraph supports multiple output roots without duplicating dependencies', () => {
    const compiled = compileGraph({
        id: 'characterGraph',
        nodes: [
            { id: 'speed', type: 'input' },
            { id: 'idle', type: 'clip' },
            { id: 'walk', type: 'clip' },
            { id: 'blend', type: 'blend', input: 'speed', a: 'idle', b: 'walk' },
        ],
        output: ['blend', 'walk'],
    });

    assert.deepEqual(compiled.output, {
        kind: 'nodes',
        nodeIds: ['blend', 'walk'],
    });
    assert.deepEqual(compiled.order, ['speed', 'idle', 'walk', 'blend']);
});

test('compileGraph rejects missing output references', () => {
    assert.throws(
        () =>
            compileGraph({
                id: 'characterGraph',
                nodes: [{ id: 'idle', type: 'clip' }],
                output: 'walk',
            }),
        /Animation graph output references missing node: walk/
    );
});
