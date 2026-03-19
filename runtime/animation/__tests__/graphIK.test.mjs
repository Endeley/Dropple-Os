import test from 'node:test';
import assert from 'node:assert/strict';

import { compileGraph } from '../graph/graphCompiler.js';
import { evaluateGraph } from '../graph/graphEvaluation.js';

test('ik produces deterministic output', () => {
    const compiled = compileGraph({
        id: 'ikGraph',
        nodes: [
            {
                id: 'ik',
                type: 'ik',
                chain: ['root', 'joint', 'end'],
                target: { x: 100, y: 0 },
            },
        ],
        output: 'ik',
    });

    const context = {
        rigComputed: {
            root: { x: 0, y: 0 },
            joint: { x: 50, y: 0 },
            end: { x: 100, y: 0 },
        },
    };

    const left = evaluateGraph(compiled, context);
    const right = evaluateGraph(compiled, context);

    assert.deepEqual(left, right);
});

test('ik reacts to target movement', () => {
    const compiledA = compileGraph({
        id: 'ikGraphA',
        nodes: [
            {
                id: 'ik',
                type: 'ik',
                chain: ['root', 'joint', 'end'],
                target: { x: 50, y: 50 },
            },
        ],
        output: 'ik',
    });
    const compiledB = compileGraph({
        id: 'ikGraphB',
        nodes: [
            {
                id: 'ik',
                type: 'ik',
                chain: ['root', 'joint', 'end'],
                target: { x: 80, y: 10 },
            },
        ],
        output: 'ik',
    });

    const context = {
        rigComputed: {
            root: { x: 0, y: 0 },
            joint: { x: 50, y: 0 },
            end: { x: 100, y: 0 },
        },
    };

    const left = evaluateGraph(compiledA, context);
    const right = evaluateGraph(compiledB, context);

    assert.equal(left.length, 1);
    assert.equal(left[0].channels.length, 2);
    assert.notDeepEqual(left, right);
});

test('ik can resolve target coordinates from upstream x/y channels', () => {
    const compiled = compileGraph({
        id: 'ikGraphInput',
        nodes: [
            {
                id: 'targetX',
                type: 'value',
                controllerId: 'target_CTRL',
                channel: 'x',
                value: 60,
            },
            {
                id: 'targetY',
                type: 'value',
                controllerId: 'target_CTRL',
                channel: 'y',
                value: 20,
            },
            {
                id: 'target',
                type: 'passthrough',
                inputs: ['targetX', 'targetY'],
            },
            {
                id: 'ik',
                type: 'ik',
                input: 'target',
                chain: ['root', 'joint', 'end'],
            },
        ],
        output: 'ik',
    });

    const result = evaluateGraph(compiled, {
        rigComputed: {
            root: { x: 0, y: 0 },
            joint: { x: 50, y: 0 },
            end: { x: 100, y: 0 },
        },
    });

    assert.equal(result.length, 1);
    assert.equal(result[0].channels.length, 2);
});
