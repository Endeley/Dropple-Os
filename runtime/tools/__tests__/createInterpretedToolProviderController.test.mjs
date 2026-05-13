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

const RIG_PROVIDER = Object.freeze({
    source: 'capability.rig',
    specs: Object.freeze([
        Object.freeze({ id: 'move', label: 'Move', sessionType: 'move' }),
        Object.freeze({ id: 'rig-select', label: 'Rig Select', handlerFamily: 'utility' }),
        Object.freeze({ id: 'rig-move', label: 'Rig Move', sessionType: 'move' }),
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
                    descriptors: [
                        {
                            id: 'frame',
                            label: 'Frame',
                            group: null,
                            defaultActive: false,
                            handlerFamily: 'createNode',
                            intentTopics: [],
                            capabilityTags: [],
                            metadata: { createsNode: true },
                            handlerPayload: { nodeType: 'frame' },
                            executionSignature: {
                                schemaVersion: '1.0',
                                executionMode: 'createNode',
                                intentKind: 'create-node',
                                nodeType: 'frame',
                                sessionType: '',
                            },
                        },
                        {
                            id: 'shape',
                            label: 'Shape',
                            group: null,
                            defaultActive: false,
                            handlerFamily: 'createNode',
                            intentTopics: [],
                            capabilityTags: [],
                            metadata: { createsNode: true },
                            handlerPayload: { nodeType: 'shape' },
                            executionSignature: {
                                schemaVersion: '1.0',
                                executionMode: 'createNode',
                                intentKind: 'create-node',
                                nodeType: 'shape',
                                sessionType: '',
                            },
                        },
                    ],
                    priority: 0,
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
                descriptors: [
                    {
                        id: 'shape',
                        label: 'Shape',
                        group: null,
                        defaultActive: false,
                        handlerFamily: 'createNode',
                        intentTopics: [],
                        capabilityTags: [],
                        metadata: { createsNode: true },
                        handlerPayload: { nodeType: 'shape' },
                        executionSignature: {
                            schemaVersion: '1.0',
                            executionMode: 'createNode',
                            intentKind: 'create-node',
                            nodeType: 'shape',
                            sessionType: '',
                        },
                    },
                ],
                priority: 0,
            },
        },
    });
});

test('interpreted tool provider controller preserves surviving provider visibility when one source is removed', () => {
    const emitted = [];
    const controller = createInterpretedToolProviderController({
        emit(type, payload) {
            emitted.push({ type, payload });
        },
    });

    const initial = controller.sync({
        providers: [RIG_PROVIDER, GRAPH_PROVIDER],
        capabilitySet: new Set(['layout.write', 'node.create']),
        allowedToolIds: ['frame', 'move', 'shape', 'rig-select', 'rig-move'],
    });
    const next = controller.sync({
        providers: [GRAPH_PROVIDER],
        capabilitySet: new Set(['layout.write', 'node.create']),
        allowedToolIds: ['frame', 'move', 'shape'],
    });

    assert.deepEqual(initial.toolsBySource, {
        'capability.graph': ['frame', 'move', 'shape'],
        'capability.rig': ['move', 'rig-move', 'rig-select'],
    });
    assert.deepEqual(next.toolsBySource, {
        'capability.graph': ['frame', 'move', 'shape'],
    });
    assert.deepEqual(emitted.at(-1), {
        type: 'capability.tools.unregister.requested',
        payload: {
            type: 'capability.tools.unregister.requested',
            payload: {
                source: 'capability.rig',
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
