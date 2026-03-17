import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateGraphs } from '../graph/graphRuntime.js';
import { resolveGraphParameters } from '../graph/resolveGraphParameters.js';

test('evaluateGraphs returns graph layers in deterministic graph id order', () => {
    const runtime = {};
    const snapshot = {
        document: {
            graphs: [
                {
                    id: 'zGraph',
                    nodes: [
                        {
                            id: 'zValue',
                            type: 'value',
                            controllerId: 'z_CTRL',
                            channel: 'rotateZ',
                            value: 9,
                        },
                    ],
                    output: 'zValue',
                },
                {
                    id: 'aGraph',
                    rigId: 'heroRig',
                    nodes: [
                        {
                            id: 'aValue',
                            type: 'value',
                            controllerId: 'a_CTRL',
                            channel: 'rotateX',
                            value: 3,
                        },
                    ],
                    output: 'aValue',
                },
            ],
        },
        runtime,
    };

    const result = evaluateGraphs(snapshot, { frame: 0 });

    assert.equal(result.length, 2);
    assert.deepEqual(
        result.map((layer) => layer.channels[0].controllerId),
        ['a_CTRL', 'z_CTRL']
    );
    assert.equal(result[0].rigId, 'heroRig');
    assert.ok(runtime.__graphCache instanceof Map);
    assert.equal(
        Object.prototype.propertyIsEnumerable.call(runtime, '__graphCache'),
        false
    );
});

test('evaluateGraphs reuses cached compiled graphs for the same source object', () => {
    const graph = {
        id: 'characterGraph',
        nodes: [
            {
                id: 'armValue',
                type: 'value',
                controllerId: 'arm_CTRL',
                channel: 'rotateX',
                value: 11,
            },
        ],
        output: 'armValue',
    };
    const runtime = {};
    const snapshot = {
        document: {
            graphs: [graph],
        },
        runtime,
    };

    const first = evaluateGraphs(snapshot, {});
    const compiled = runtime.__graphCache.get('characterGraph');
    const second = evaluateGraphs(snapshot, {});

    assert.equal(runtime.__graphCache.get('characterGraph'), compiled);
    assert.deepEqual(second, first);
});

test('evaluateGraphs resolves parameters per graph before evaluation', () => {
    const result = evaluateGraphs(
        {
            document: {
                graphs: [
                    {
                        id: 'clampedGraph',
                        parameters: {
                            speed: { type: 'number', min: 0, max: 1, default: 0.25 },
                        },
                        nodes: [
                            {
                                id: 'speedParam',
                                type: 'parameter',
                                name: 'speed',
                                controllerId: 'arm_CTRL',
                                channel: 'rotateX',
                            },
                        ],
                        output: 'speedParam',
                    },
                ],
            },
            runtime: {},
        },
        {
            parameters: { speed: 5 },
        }
    );

    assert.equal(result.length, 1);
    assert.equal(result[0].channels[0].value, 1);
    assert.deepEqual(
        { ...resolveGraphParameters({
            graph: {
                parameters: {
                    speed: { type: 'number', min: 0, max: 1, default: 0.25 },
                },
            },
            injected: { speed: 5 },
        }) },
        { speed: 1 }
    );
});
