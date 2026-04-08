import test from 'node:test';
import assert from 'node:assert/strict';

import { graphReducers } from '@/core/events/reducers/graphReducers.js';
import { EventTypes } from '@/core/events/eventTypes.js';

function reduce(state, type, payload) {
    return graphReducers(state, {
        type,
        payload,
    });
}

test('graph node add is deterministic for array-backed graphs', () => {
    const state = {
        document: {
            graphs: [
                {
                    id: 'g1',
                    nodes: [],
                    output: null,
                },
            ],
        },
    };

    const next = reduce(state, EventTypes.GRAPH_NODE_ADD, {
        graphId: 'g1',
        node: { id: 'a', type: 'value', position: { x: 10, y: 20 } },
    });

    assert.equal(next.document.graphs[0].nodes.length, 1);
    assert.deepEqual(next.document.graphs[0].nodes[0], {
        id: 'a',
        type: 'value',
        position: { x: 10, y: 20 },
    });
});

test('graph update patches authored graph metadata immutably', () => {
    const state = {
        document: {
            graphs: {
                g1: {
                    id: 'g1',
                    enabled: true,
                    rigId: null,
                    nodes: {
                        source: { id: 'source', type: 'value' },
                    },
                    output: 'source',
                },
            },
        },
    };

    const next = reduce(state, EventTypes.GRAPH_UPDATE, {
        graphId: 'g1',
        patch: {
            enabled: false,
            rigId: 'heroRig',
        },
    });

    assert.equal(next.document.graphs.g1.enabled, false);
    assert.equal(next.document.graphs.g1.rigId, 'heroRig');
    assert.equal(state.document.graphs.g1.enabled, true);
    assert.equal(state.document.graphs.g1.rigId, null);
});

test('graph connect updates target dependency field for compiler-compatible graphs', () => {
    const state = {
        document: {
            graphs: {
                g1: {
                    id: 'g1',
                    nodes: {
                        source: { id: 'source', type: 'value' },
                        target: { id: 'target', type: 'spring' },
                    },
                    output: 'target',
                },
            },
        },
    };

    const next = reduce(state, EventTypes.GRAPH_CONNECT, {
        graphId: 'g1',
        from: 'source',
        to: 'target',
        input: 'input',
    });

    assert.equal(next.document.graphs.g1.nodes.target.input, 'source');
});

test('graph connect rejects self-connections', () => {
    const state = {
        document: {
            graphs: {
                g1: {
                    id: 'g1',
                    nodes: {
                        source: { id: 'source', type: 'value' },
                    },
                    output: 'source',
                },
            },
        },
    };

    assert.throws(
        () =>
            reduce(state, EventTypes.GRAPH_CONNECT, {
                graphId: 'g1',
                from: 'source',
                to: 'source',
                input: 'input',
            }),
        /Cannot connect node to itself/,
    );
});

test('graph connect rejects overwriting an occupied input with a different source', () => {
    const state = {
        document: {
            graphs: {
                g1: {
                    id: 'g1',
                    nodes: {
                        sourceA: { id: 'sourceA', type: 'value' },
                        sourceB: { id: 'sourceB', type: 'value' },
                        target: { id: 'target', type: 'spring', input: 'sourceA' },
                    },
                    output: 'target',
                },
            },
        },
    };

    assert.throws(
        () =>
            reduce(state, EventTypes.GRAPH_CONNECT, {
                graphId: 'g1',
                from: 'sourceB',
                to: 'target',
                input: 'input',
            }),
        /Graph input already connected/,
    );
});

test('graph connect rejects unsupported input names', () => {
    const state = {
        document: {
            graphs: {
                g1: {
                    id: 'g1',
                    nodes: {
                        source: { id: 'source', type: 'value' },
                        target: { id: 'target', type: 'spring' },
                    },
                    output: 'target',
                },
            },
        },
    };

    assert.throws(
        () =>
            reduce(state, EventTypes.GRAPH_CONNECT, {
                graphId: 'g1',
                from: 'source',
                to: 'target',
                input: 'targetX',
            }),
        /Unsupported graph input/,
    );
});

test('graph disconnect removes target dependency field', () => {
    const state = {
        document: {
            graphs: {
                g1: {
                    id: 'g1',
                    nodes: {
                        source: { id: 'source', type: 'value' },
                        target: { id: 'target', type: 'spring', input: 'source' },
                    },
                    output: 'target',
                },
            },
        },
    };

    const next = reduce(state, EventTypes.GRAPH_DISCONNECT, {
        graphId: 'g1',
        from: 'source',
        to: 'target',
        input: 'input',
    });

    assert.equal('input' in next.document.graphs.g1.nodes.target, false);
});

test('graph parameter update changes default value immutably', () => {
    const state = {
        document: {
            graphs: {
                g1: {
                    id: 'g1',
                    nodes: {
                        p: { id: 'p', type: 'parameter' },
                    },
                    parameters: {
                        speed: { type: 'number', default: 0 },
                    },
                    output: 'p',
                },
            },
        },
    };

    const next = reduce(state, EventTypes.GRAPH_PARAMETER_UPDATE, {
        graphId: 'g1',
        parameterId: 'speed',
        value: 1,
    });

    assert.equal(next.document.graphs.g1.parameters.speed.default, 1);
    assert.equal(state.document.graphs.g1.parameters.speed.default, 0);
});
