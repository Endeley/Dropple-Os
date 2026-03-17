import test from 'node:test';
import assert from 'node:assert/strict';

import { compileGraph } from '../graph/graphCompiler.js';
import { evaluateGraph } from '../graph/graphEvaluation.js';

function compileCurveGraph({ inputValue = 0, keys, curveOverrides = {} } = {}) {
    return compileGraph({
        id: 'curveGraph',
        nodes: [
            {
                id: 'input',
                type: 'value',
                controllerId: 'driver_CTRL',
                channel: 'driver',
                value: inputValue,
            },
            {
                id: 'curve',
                type: 'curve',
                input: 'input',
                controllerId: 'c1',
                channel: 'x',
                keys,
                ...curveOverrides,
            },
        ],
        output: 'curve',
    });
}

test('curve interpolates between keys', () => {
    const compiled = compileCurveGraph({
        inputValue: 0.5,
        keys: [
            { x: 0, y: 0 },
            { x: 1, y: 10 },
        ],
    });

    const result = evaluateGraph(compiled, {});

    assert.equal(result[0].channels[0].value, 5);
});

test('curve clamps below the first key', () => {
    const compiled = compileCurveGraph({
        inputValue: -1,
        keys: [
            { x: 0, y: 2 },
            { x: 1, y: 10 },
        ],
    });

    const result = evaluateGraph(compiled, {});

    assert.equal(result[0].channels[0].value, 2);
});

test('curve clamps above the last key', () => {
    const compiled = compileCurveGraph({
        inputValue: 5,
        keys: [
            { x: 0, y: 2 },
            { x: 1, y: 10 },
        ],
    });

    const result = evaluateGraph(compiled, {});

    assert.equal(result[0].channels[0].value, 10);
});

test('curve is deterministic regardless of key order', () => {
    const left = compileCurveGraph({
        inputValue: 0.5,
        keys: [
            { x: 0, y: 0 },
            { x: 1, y: 10 },
        ],
    });
    const right = compileCurveGraph({
        inputValue: 0.5,
        keys: [
            { x: 1, y: 10 },
            { x: 0, y: 0 },
        ],
    });

    assert.deepEqual(evaluateGraph(left, {}), evaluateGraph(right, {}));
});
