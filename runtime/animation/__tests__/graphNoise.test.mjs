import test from 'node:test';
import assert from 'node:assert/strict';

import { compileGraph } from '../graph/graphCompiler.js';
import { evaluateGraph } from '../graph/graphEvaluation.js';

function compileNoiseGraph(overrides = {}) {
    return compileGraph({
        id: 'noiseGraph',
        nodes: [
            {
                id: 'n1',
                type: 'noise',
                controllerId: 'c1',
                channel: 'x',
                seed: 1,
                ...overrides,
            },
        ],
        output: 'n1',
    });
}

test('noise node is deterministic for the same frame', () => {
    const compiled = compileNoiseGraph();

    const left = evaluateGraph(compiled, { frame: 10 });
    const right = evaluateGraph(compiled, { frame: 10 });

    assert.deepEqual(left, right);
});

test('noise node changes with frame', () => {
    const compiled = compileNoiseGraph();

    const left = evaluateGraph(compiled, { frame: 1 });
    const right = evaluateGraph(compiled, { frame: 2 });

    assert.notDeepEqual(left, right);
});

test('noise node respects amplitude', () => {
    const compiled = compileNoiseGraph({ amplitude: 10 });
    const result = evaluateGraph(compiled, { frame: 5 });
    const value = result[0].channels[0].value;

    assert.ok(Math.abs(value) <= 10);
});

test('noise node frequency affects output', () => {
    const slow = compileNoiseGraph({ frequency: 0.1 });
    const fast = compileNoiseGraph({ frequency: 10 });

    const left = evaluateGraph(slow, { frame: 10 });
    const right = evaluateGraph(fast, { frame: 10 });

    assert.notDeepEqual(left, right);
});
