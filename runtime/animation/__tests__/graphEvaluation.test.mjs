import test from 'node:test';
import assert from 'node:assert/strict';

import { compileGraph } from '../graph/graphCompiler.js';
import { evaluateGraph } from '../graph/graphEvaluation.js';

test('evaluateGraph returns blend-ready layers from value nodes', () => {
    const compiled = compileGraph({
        id: 'characterGraph',
        nodes: [
            {
                id: 'armValue',
                type: 'value',
                controllerId: 'arm_CTRL',
                channel: 'rotateX',
                value: 35,
            },
        ],
        output: 'armValue',
    });

    const result = evaluateGraph(compiled);

    assert.deepEqual(result, [
        {
            id: 'node:armValue',
            mode: 'replace',
            weight: 1,
            channels: [
                {
                    controllerId: 'arm_CTRL',
                    channel: 'rotateX',
                    value: 35,
                },
            ],
        },
    ]);
});

test('evaluateGraph composes add and mix nodes deterministically', () => {
    const compiled = compileGraph({
        id: 'characterGraph',
        nodes: [
            {
                id: 'base',
                type: 'value',
                controllerId: 'arm_CTRL',
                channel: 'rotateX',
                value: 10,
            },
            {
                id: 'offset',
                type: 'value',
                controllerId: 'arm_CTRL',
                channel: 'rotateX',
                value: 20,
            },
            {
                id: 'sum',
                type: 'add',
                a: 'base',
                b: 'offset',
            },
            {
                id: 'mixed',
                type: 'mix',
                a: 'base',
                b: 'sum',
                weight: 0.5,
            },
        ],
        output: 'mixed',
    });

    const result = evaluateGraph(compiled);

    assert.deepEqual(result, [
        {
            id: 'merged',
            mode: 'replace',
            weight: 1,
            channels: [
                {
                    controllerId: 'arm_CTRL',
                    channel: 'rotateX',
                    value: 20,
                },
            ],
        },
    ]);
});

test('evaluateGraph resolves parameter nodes from context parameters', () => {
    const compiled = compileGraph({
        id: 'characterGraph',
        nodes: [
            {
                id: 'speedParam',
                type: 'parameter',
                name: 'speed',
                default: 2,
                controllerId: 'leg_CTRL',
                channel: 'stride',
            },
        ],
        output: 'speedParam',
    });

    const result = evaluateGraph(compiled, {
        parameters: {
            speed: 7,
        },
    });

    assert.equal(result[0].channels[0].value, 7);
});

test('evaluateGraph supports multiple output roots', () => {
    const compiled = compileGraph({
        id: 'characterGraph',
        nodes: [
            {
                id: 'armValue',
                type: 'value',
                controllerId: 'arm_CTRL',
                channel: 'rotateX',
                value: 5,
            },
            {
                id: 'headValue',
                type: 'value',
                controllerId: 'head_CTRL',
                channel: 'rotateY',
                value: 12,
            },
        ],
        output: ['armValue', 'headValue'],
    });

    const result = evaluateGraph(compiled);

    assert.equal(result.length, 2);
    assert.deepEqual(
        result.map((layer) => layer.channels[0].controllerId),
        ['arm_CTRL', 'head_CTRL']
    );
});

test('evaluateGraph throws on unknown node types', () => {
    const compiled = compileGraph({
        id: 'characterGraph',
        nodes: [
            {
                id: 'mystery',
                type: 'unknown',
            },
        ],
        output: 'mystery',
    });

    assert.throws(
        () => evaluateGraph(compiled),
        /Unknown animation graph node type: unknown/
    );
});
