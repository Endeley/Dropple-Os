import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import { registerGraphIntentBridge } from '@/ui/bridges/graphIntentBridge.js';
import { GRAPH_INTENTS } from '@/ui/graph/graphIntent.js';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';

test('graph intent bridge translates graph enable intent into canonical graph enable event', () => {
    const dispatched = [];
    const cleanup = registerGraphIntentBridge({
        dispatch(event) {
            dispatched.push(event);
        },
    });

    try {
        canvasBus.emit(GRAPH_INTENTS.ENABLE, {
            graphId: 'graph-1',
        });
    } finally {
        cleanup?.();
    }

    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.GRAPH_ENABLE);
    assert.deepEqual(dispatched[0]?.payload, { graphId: 'graph-1' });
});

test('graph intent bridge translates graph disable intent into canonical graph disable event', () => {
    const dispatched = [];
    const cleanup = registerGraphIntentBridge({
        dispatch(event) {
            dispatched.push(event);
        },
    });

    try {
        canvasBus.emit(GRAPH_INTENTS.DISABLE, {
            graphId: 'graph-1',
        });
    } finally {
        cleanup?.();
    }

    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.GRAPH_DISABLE);
    assert.deepEqual(dispatched[0]?.payload, { graphId: 'graph-1' });
});

test('graph intent bridge translates graph set rig intent into canonical graph set rig event', () => {
    const dispatched = [];
    const cleanup = registerGraphIntentBridge({
        dispatch(event) {
            dispatched.push(event);
        },
    });

    try {
        canvasBus.emit(GRAPH_INTENTS.SET_RIG, {
            graphId: 'graph-1',
            rigId: 'heroRig',
        });
    } finally {
        cleanup?.();
    }

    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.GRAPH_SET_RIG);
    assert.deepEqual(dispatched[0]?.payload, {
        graphId: 'graph-1',
        rigId: 'heroRig',
    });
});

test('graph intent bridge translates graph set priority intent into canonical graph set priority event', () => {
    const dispatched = [];
    const cleanup = registerGraphIntentBridge({
        dispatch(event) {
            dispatched.push(event);
        },
    });

    try {
        canvasBus.emit(GRAPH_INTENTS.SET_PRIORITY, {
            graphId: 'graph-1',
            priority: 7,
        });
    } finally {
        cleanup?.();
    }

    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.GRAPH_SET_PRIORITY);
    assert.deepEqual(dispatched[0]?.payload, {
        graphId: 'graph-1',
        priority: 7,
    });
});

test('graph intent bridge translates graph metadata update intent into canonical graph metadata update event', () => {
    const dispatched = [];
    const cleanup = registerGraphIntentBridge({
        dispatch(event) {
            dispatched.push(event);
        },
    });

    try {
        canvasBus.emit(GRAPH_INTENTS.METADATA_UPDATE, {
            graphId: 'graph-1',
            patch: {
                label: 'Hero Graph',
            },
        });
    } finally {
        cleanup?.();
    }

    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.GRAPH_METADATA_UPDATE);
    assert.deepEqual(dispatched[0]?.payload, {
        graphId: 'graph-1',
        patch: {
            label: 'Hero Graph',
        },
    });
});

test('graph intent bridge translates graph node create intent into canonical graph node add event', () => {
    const dispatched = [];
    const cleanup = registerGraphIntentBridge({
        dispatch(event) {
            dispatched.push(event);
        },
    });

    try {
        canvasBus.emit(GRAPH_INTENTS.NODE_CREATE, {
            graphId: 'graph-1',
            nodeId: 'value-1',
            nodeType: 'value',
            position: { x: 24, y: 36 },
        });
    } finally {
        cleanup?.();
    }

    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.GRAPH_NODE_ADD);
    assert.deepEqual(dispatched[0]?.payload, {
        graphId: 'graph-1',
        node: {
            id: 'value-1',
            type: 'value',
            position: { x: 24, y: 36 },
            controllerId: '',
            channel: 'rotation',
            value: 0,
        },
    });
});

test('graph intent bridge translates graph node delete intent into canonical graph node delete event', () => {
    const dispatched = [];
    const cleanup = registerGraphIntentBridge({
        dispatch(event) {
            dispatched.push(event);
        },
    });

    try {
        canvasBus.emit(GRAPH_INTENTS.NODE_DELETE, {
            graphId: 'graph-1',
            nodeId: 'value-1',
        });
    } finally {
        cleanup?.();
    }

    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.GRAPH_NODE_DELETE);
    assert.deepEqual(dispatched[0]?.payload, {
        graphId: 'graph-1',
        nodeId: 'value-1',
    });
});

test('graph intent bridge translates graph node update intent into canonical graph node update event', () => {
    const dispatched = [];
    const cleanup = registerGraphIntentBridge({
        dispatch(event) {
            dispatched.push(event);
        },
    });

    try {
        canvasBus.emit(GRAPH_INTENTS.NODE_UPDATE, {
            graphId: 'graph-1',
            nodeId: 'value-1',
            patch: {
                value: 12,
            },
        });
    } finally {
        cleanup?.();
    }

    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.GRAPH_NODE_UPDATE);
    assert.deepEqual(dispatched[0]?.payload, {
        graphId: 'graph-1',
        nodeId: 'value-1',
        patch: {
            value: 12,
        },
    });
});

test('graph intent bridge translates graph output set intent into canonical graph output set event', () => {
    const dispatched = [];
    const cleanup = registerGraphIntentBridge({
        dispatch(event) {
            dispatched.push(event);
        },
    });

    try {
        canvasBus.emit(GRAPH_INTENTS.OUTPUT_SET, {
            graphId: 'graph-1',
            nodeId: 'spring-1',
        });
    } finally {
        cleanup?.();
    }

    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.GRAPH_OUTPUT_SET);
    assert.deepEqual(dispatched[0]?.payload, {
        graphId: 'graph-1',
        nodeId: 'spring-1',
    });
});

test('graph intent bridge translates graph connection create intent into canonical graph connect event', () => {
    const dispatched = [];
    const cleanup = registerGraphIntentBridge({
        dispatch(event) {
            dispatched.push(event);
        },
    });

    try {
        canvasBus.emit(GRAPH_INTENTS.CONNECTION_CREATE, {
            graphId: 'graph-1',
            from: 'value-1',
            to: 'spring-1',
            input: 'input',
        });
    } finally {
        cleanup?.();
    }

    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.GRAPH_CONNECT);
    assert.deepEqual(dispatched[0]?.payload, {
        graphId: 'graph-1',
        from: 'value-1',
        to: 'spring-1',
        input: 'input',
    });
});

test('graph intent bridge translates graph connection delete intent into canonical graph disconnect event', () => {
    const dispatched = [];
    const cleanup = registerGraphIntentBridge({
        dispatch(event) {
            dispatched.push(event);
        },
    });

    try {
        canvasBus.emit(GRAPH_INTENTS.CONNECTION_DELETE, {
            graphId: 'graph-1',
            from: 'value-1',
            to: 'spring-1',
            input: 'input',
        });
    } finally {
        cleanup?.();
    }

    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.GRAPH_DISCONNECT);
    assert.deepEqual(dispatched[0]?.payload, {
        graphId: 'graph-1',
        from: 'value-1',
        to: 'spring-1',
        input: 'input',
    });
});
