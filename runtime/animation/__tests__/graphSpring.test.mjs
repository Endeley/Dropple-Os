import test from 'node:test';
import assert from 'node:assert/strict';

import { compileGraph } from '../graph/graphCompiler.js';
import { evaluateGraph } from '../graph/graphEvaluation.js';

function compileSpringGraph({ inputValue = 1 } = {}) {
    return compileGraph({
        id: 'springGraph',
        nodes: [
            {
                id: 'input',
                type: 'value',
                controllerId: 'c',
                channel: 'x',
                value: inputValue,
            },
            {
                id: 'spring',
                type: 'spring',
                input: 'input',
                controllerId: 'c',
                channel: 'x',
                stiffness: 10,
                damping: 5,
            },
        ],
        output: 'spring',
    });
}

test('spring starts near zero at frame 0', () => {
    const compiled = compileSpringGraph({ inputValue: 1 });
    const result = evaluateGraph(compiled, { frame: 0 });

    assert.ok(result[0].channels[0].value < 0.01);
});

test('spring increases over time', () => {
    const compiled = compileSpringGraph({ inputValue: 1 });
    const early = evaluateGraph(compiled, { frame: 1 });
    const later = evaluateGraph(compiled, { frame: 30 });

    assert.ok(later[0].channels[0].value > early[0].channels[0].value);
});

test('spring is deterministic', () => {
    const compiled = compileSpringGraph({ inputValue: 1 });
    const left = evaluateGraph(compiled, { frame: 42 });
    const right = evaluateGraph(compiled, { frame: 42 });

    assert.deepEqual(left, right);
});

test('spring responds to stiffness', () => {
    const compiledSoft = compileGraph({
        id: 'soft',
        nodes: [
            { id: 'v', type: 'value', value: 1, controllerId: 'c', channel: 'x' },
            {
                id: 's',
                type: 'spring',
                input: 'v',
                stiffness: 5,
                damping: 5,
                controllerId: 'c',
                channel: 'x',
            },
        ],
        output: 's',
    });
    const compiledHard = compileGraph({
        id: 'hard',
        nodes: [
            { id: 'v', type: 'value', value: 1, controllerId: 'c', channel: 'x' },
            {
                id: 's',
                type: 'spring',
                input: 'v',
                stiffness: 20,
                damping: 5,
                controllerId: 'c',
                channel: 'x',
            },
        ],
        output: 's',
    });

    const soft = evaluateGraph(compiledSoft, { frame: 10 });
    const hard = evaluateGraph(compiledHard, { frame: 10 });

    assert.notEqual(soft[0].channels[0].value, hard[0].channels[0].value);
});
