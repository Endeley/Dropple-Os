import test from 'node:test';
import assert from 'node:assert/strict';
import { createInterpretedToolProviderController } from '@/runtime/tools/createInterpretedToolProviderController.js';

const GRAPH_PROVIDER = Object.freeze({
    source: 'capability.graph',
    specs: Object.freeze([
        Object.freeze({ id: 'select', label: 'Select' }),
        Object.freeze({ id: 'move', label: 'Move' }),
        Object.freeze({ id: 'frame', label: 'Frame', createsNode: true, nodeType: 'frame' }),
        Object.freeze({ id: 'shape', label: 'Shape', createsNode: true, nodeType: 'shape' }),
    ]),
});

test('interpreted tool provider controller registers visible tools on first sync', () => {
    const emitted = [];
    const controller = createInterpretedToolProviderController({
        emit(type, payload) {
            emitted.push({ type, payload });
        },
    });

    const snapshot = controller.sync({
        providers: [GRAPH_PROVIDER],
        capabilitySet: new Set(['node.create']),
        allowedToolIds: ['shape', 'frame'],
    });

    assert.deepEqual(snapshot.toolsBySource, {
        'capability.graph': ['frame', 'shape'],
    });
    assert.deepEqual(emitted, [
        {
            type: 'capability.tools.register.requested',
            payload: {
                type: 'capability.tools.register.requested',
                payload: {
                    source: 'capability.graph',
                    tools: ['frame', 'shape'],
                },
            },
        },
    ]);
});

test('interpreted tool provider controller updates visibility deterministically as allowed tools change', () => {
    const emitted = [];
    const controller = createInterpretedToolProviderController({
        emit(type, payload) {
            emitted.push({ type, payload });
        },
    });

    controller.sync({
        providers: [GRAPH_PROVIDER],
        capabilitySet: new Set(['node.create']),
        allowedToolIds: ['frame', 'shape'],
    });
    controller.sync({
        providers: [GRAPH_PROVIDER],
        capabilitySet: new Set(['node.create']),
        allowedToolIds: ['shape'],
    });

    assert.deepEqual(emitted[1], {
        type: 'capability.tools.register.requested',
        payload: {
            type: 'capability.tools.register.requested',
            payload: {
                source: 'capability.graph',
                tools: ['shape'],
            },
        },
    });
});

test('interpreted tool provider controller unregisters when providers are removed', () => {
    const emitted = [];
    const controller = createInterpretedToolProviderController({
        emit(type, payload) {
            emitted.push({ type, payload });
        },
    });

    controller.sync({
        providers: [GRAPH_PROVIDER],
        capabilitySet: new Set(['node.create']),
        allowedToolIds: ['shape'],
    });
    const snapshot = controller.sync({
        providers: [],
        capabilitySet: new Set(['node.create']),
        allowedToolIds: ['shape'],
    });

    assert.deepEqual(snapshot.toolsBySource, {});
    assert.deepEqual(emitted[1], {
        type: 'capability.tools.unregister.requested',
        payload: {
            type: 'capability.tools.unregister.requested',
            payload: {
                source: 'capability.graph',
            },
        },
    });
});

test('interpreted tool provider controller disposes all active sources cleanly', () => {
    const emitted = [];
    const controller = createInterpretedToolProviderController({
        emit(type, payload) {
            emitted.push({ type, payload });
        },
    });

    controller.sync({
        providers: [GRAPH_PROVIDER],
        capabilitySet: new Set(['node.create']),
        allowedToolIds: ['shape'],
    });
    controller.dispose();

    assert.deepEqual(emitted[1], {
        type: 'capability.tools.unregister.requested',
        payload: {
            type: 'capability.tools.unregister.requested',
            payload: {
                source: 'capability.graph',
            },
        },
    });
});
