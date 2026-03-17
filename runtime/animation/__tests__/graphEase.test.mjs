import test from 'node:test';
import assert from 'node:assert/strict';

import { compileGraph } from '../graph/graphCompiler.js';
import { evaluateGraph } from '../graph/graphEvaluation.js';

function compileEaseGraph({ inputValue = 0, mode = 'linear' } = {}) {
    return compileGraph({
        id: 'easeGraph',
        nodes: [
            {
                id: 'input',
                type: 'value',
                controllerId: 'driver_CTRL',
                channel: 'driver',
                value: inputValue,
            },
            {
                id: 'ease',
                type: 'ease',
                input: 'input',
                controllerId: 'c1',
                channel: 'x',
                mode,
            },
        ],
        output: 'ease',
    });
}

test('ease linear returns the same normalized value', () => {
    const compiled = compileEaseGraph({ inputValue: 0.3, mode: 'linear' });
    const result = evaluateGraph(compiled, {});

    assert.equal(result[0].channels[0].value, 0.3);
});

test('easeIn accelerates', () => {
    const compiled = compileEaseGraph({ inputValue: 0.5, mode: 'easeIn' });
    const result = evaluateGraph(compiled, {});

    assert.ok(result[0].channels[0].value < 0.5);
});

test('easeOut decelerates', () => {
    const compiled = compileEaseGraph({ inputValue: 0.5, mode: 'easeOut' });
    const result = evaluateGraph(compiled, {});

    assert.ok(result[0].channels[0].value > 0.5);
});

test('ease clamps input into the 0..1 range', () => {
    const compiled = compileEaseGraph({ inputValue: 10, mode: 'easeInOut' });
    const result = evaluateGraph(compiled, {});

    assert.ok(result[0].channels[0].value <= 1);
    assert.ok(result[0].channels[0].value >= 0);
});

test('ease node is deterministic', () => {
    const compiled = compileEaseGraph({ inputValue: 0.42, mode: 'easeInOut' });

    const left = evaluateGraph(compiled, {});
    const right = evaluateGraph(compiled, {});

    assert.deepEqual(left, right);
});
