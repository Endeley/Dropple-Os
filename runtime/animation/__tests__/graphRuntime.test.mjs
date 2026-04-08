import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateGraphs } from '../graph/graphRuntime.js';
import { resolveGraphParameters } from '../graph/resolveGraphParameters.js';

function orderOf(layers) {
    return layers.map((layer) => layer.channels[0]?.controllerId);
}

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

test('evaluateGraphs orders graphs by priority descending', () => {
    const snapshot = {
        document: {
            graphs: [
                {
                    id: 'lowGraph',
                    priority: 0,
                    nodes: [
                        {
                            id: 'lowValue',
                            type: 'value',
                            controllerId: 'low_CTRL',
                            channel: 'rotateX',
                            value: 1,
                        },
                    ],
                    output: 'lowValue',
                },
                {
                    id: 'highGraph',
                    priority: 10,
                    nodes: [
                        {
                            id: 'highValue',
                            type: 'value',
                            controllerId: 'high_CTRL',
                            channel: 'rotateX',
                            value: 2,
                        },
                    ],
                    output: 'highValue',
                },
            ],
        },
        runtime: {},
    };

    const result = evaluateGraphs(snapshot, { frame: 0 });

    assert.deepEqual(orderOf(result), ['high_CTRL', 'low_CTRL']);
    assert.deepEqual(result.map((layer) => layer.priority), [10, 0]);
});

test('evaluateGraphs orders equal-priority graphs by id ascending', () => {
    const snapshot = {
        document: {
            graphs: [
                {
                    id: 'bGraph',
                    priority: 0,
                    nodes: [
                        {
                            id: 'bValue',
                            type: 'value',
                            controllerId: 'b_CTRL',
                            channel: 'rotateX',
                            value: 1,
                        },
                    ],
                    output: 'bValue',
                },
                {
                    id: 'aGraph',
                    priority: 0,
                    nodes: [
                        {
                            id: 'aValue',
                            type: 'value',
                            controllerId: 'a_CTRL',
                            channel: 'rotateX',
                            value: 2,
                        },
                    ],
                    output: 'aValue',
                },
            ],
        },
        runtime: {},
    };

    const result = evaluateGraphs(snapshot, { frame: 0 });

    assert.deepEqual(orderOf(result), ['a_CTRL', 'b_CTRL']);
});

test('evaluateGraphs is stable under graph array reordering', () => {
    const graphA = {
        id: 'aGraph',
        priority: 1,
        nodes: [
            {
                id: 'aValue',
                type: 'value',
                controllerId: 'a_CTRL',
                channel: 'rotateX',
                value: 1,
            },
        ],
        output: 'aValue',
    };
    const graphB = {
        id: 'bGraph',
        priority: 2,
        nodes: [
            {
                id: 'bValue',
                type: 'value',
                controllerId: 'b_CTRL',
                channel: 'rotateX',
                value: 2,
            },
        ],
        output: 'bValue',
    };

    const resultA = evaluateGraphs(
        {
            document: { graphs: [graphA, graphB] },
            runtime: {},
        },
        { frame: 0 },
    );
    const resultB = evaluateGraphs(
        {
            document: { graphs: [graphB, graphA] },
            runtime: {},
        },
        { frame: 0 },
    );

    assert.deepEqual(resultA, resultB);
});

test('evaluateGraphs skips graphs that are authored as disabled', () => {
    const snapshot = {
        document: {
            graphs: [
                {
                    id: 'disabledGraph',
                    enabled: false,
                    nodes: [
                        {
                            id: 'disabledValue',
                            type: 'value',
                            controllerId: 'disabled_CTRL',
                            channel: 'rotateZ',
                            value: 99,
                        },
                    ],
                    output: 'disabledValue',
                },
                {
                    id: 'enabledGraph',
                    enabled: true,
                    nodes: [
                        {
                            id: 'enabledValue',
                            type: 'value',
                            controllerId: 'enabled_CTRL',
                            channel: 'rotateX',
                            value: 3,
                        },
                    ],
                    output: 'enabledValue',
                },
            ],
        },
        runtime: {},
    };

    const result = evaluateGraphs(snapshot, { frame: 0 });

    assert.equal(result.length, 1);
    assert.equal(result[0].channels[0].controllerId, 'enabled_CTRL');
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
