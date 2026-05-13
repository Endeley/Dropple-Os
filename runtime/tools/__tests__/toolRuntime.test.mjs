import test from 'node:test';
import assert from 'node:assert/strict';
import {
    getVisibleTools,
    getVisibleToolDefinitions,
    getVisibleToolOwnership,
    initialToolRuntimeState,
    registerToolSource,
    resolveCanonicalActiveTool,
    setRuntimeActiveTool,
    unregisterToolSource,
} from '@/runtime/tools/toolRuntime.js';

test('registerToolSource stores tools by source and visible tools merge deterministically', () => {
    const state = registerToolSource(initialToolRuntimeState, {
        source: 'graph',
        tools: ['select', 'pan', 'shape'],
    });
    const next = registerToolSource(state, {
        source: 'timeline',
        tools: ['select', 'cut'],
    });

    assert.deepEqual(next.registeredTools.graph, ['select', 'pan', 'shape']);
    assert.deepEqual(getVisibleTools(next), ['cut', 'pan', 'select', 'shape']);
});

test('overlapping synthesized tool ids collapse into one visible tool with deterministic source ownership', () => {
    const state = registerToolSource(
        registerToolSource(initialToolRuntimeState, {
            source: 'capability.alpha',
            tools: ['move', 'shape'],
        }),
        {
            source: 'capability.beta',
            tools: ['frame', 'move'],
        },
    );

    assert.deepEqual(getVisibleTools(state), ['frame', 'move', 'shape']);
    assert.deepEqual(getVisibleToolOwnership(state), {
        move: ['capability.alpha', 'capability.beta'],
        shape: ['capability.alpha'],
        frame: ['capability.beta'],
    });
});

test('overlapping synthesized tool ids choose semantic winner by priority then source id', () => {
    const state = registerToolSource(
        registerToolSource(initialToolRuntimeState, {
            source: 'capability.beta',
            tools: ['move'],
            priority: 50,
            descriptors: [{
                id: 'move',
                label: 'Beta Move',
                group: 'edit',
                capabilityTags: ['rig.transform'],
                intentTopics: ['rig/move'],
            }],
        }),
        {
            source: 'capability.alpha',
            tools: ['move'],
            priority: 100,
            descriptors: [{
                id: 'move',
                label: 'Alpha Move',
                group: 'edit',
                capabilityTags: ['graph.transform'],
                intentTopics: ['layout/move'],
            }],
        },
    );

    assert.deepEqual(getVisibleToolDefinitions(state).move, {
        id: 'move',
        owners: ['capability.alpha', 'capability.beta'],
        winnerSource: 'capability.alpha',
        winnerPriority: 100,
        descriptor: {
            id: 'move',
            label: 'Alpha Move',
            group: 'edit',
            capabilityTags: ['graph.transform', 'rig.transform'],
            intentTopics: ['layout/move', 'rig/move'],
        },
    });
});

test('semantic handler-family conflicts are not projected as visible tools', () => {
    const state = registerToolSource(
        registerToolSource(initialToolRuntimeState, {
            source: 'capability.graph',
            tools: ['move'],
            priority: 100,
            descriptors: [{ id: 'move', label: 'Move', handlerFamily: 'session' }],
        }),
        {
            source: 'capability.cinematic',
            tools: ['move'],
            priority: 50,
            descriptors: [{ id: 'move', label: 'Translate', handlerFamily: 'utility' }],
        },
    );

    assert.deepEqual(getVisibleToolOwnership(state), {
        move: ['capability.cinematic', 'capability.graph'],
    });
    assert.deepEqual(getVisibleTools(state), []);
    assert.deepEqual(getVisibleToolDefinitions(state), {});
});

test('visible tool projection defaults policy time deterministically when omitted', () => {
    const state = registerToolSource(
        registerToolSource(initialToolRuntimeState, {
            source: 'capability.alpha',
            tools: ['exec-version-major-migrated-shared'],
            priority: 100,
            descriptors: [{
                id: 'exec-version-major-migrated-shared',
                label: 'Exec Version Major Migrated Shared',
                handlerFamily: 'utility',
                executionSignature: {
                    schemaVersion: '1.0',
                    executionMode: 'utility',
                    intentKind: 'utility',
                    nodeType: '',
                    sessionType: '',
                },
            }],
        }),
        {
            source: 'capability.beta',
            tools: ['exec-version-major-migrated-shared'],
            priority: 50,
            descriptors: [{
                id: 'exec-version-major-migrated-shared',
                label: 'Exec Version Major Migrated Shared',
                handlerFamily: 'utility',
                executionSignature: {
                    schemaVersion: '2.0',
                    executionMode: 'utility',
                    intentKind: 'utility',
                    nodeType: '',
                    sessionType: '',
                },
            }],
        },
    );

    assert.deepEqual(getVisibleTools(state), ['exec-version-major-migrated-shared']);
});

test('visible tool projection honors explicit policy time', () => {
    const state = registerToolSource(
        registerToolSource(initialToolRuntimeState, {
            source: 'capability.alpha',
            tools: ['exec-version-major-migrated-shared'],
            priority: 100,
            descriptors: [{
                id: 'exec-version-major-migrated-shared',
                label: 'Exec Version Major Migrated Shared',
                handlerFamily: 'utility',
                executionSignature: {
                    schemaVersion: '1.0',
                    executionMode: 'utility',
                    intentKind: 'utility',
                    nodeType: '',
                    sessionType: '',
                },
            }],
        }),
        {
            source: 'capability.beta',
            tools: ['exec-version-major-migrated-shared'],
            priority: 50,
            descriptors: [{
                id: 'exec-version-major-migrated-shared',
                label: 'Exec Version Major Migrated Shared',
                handlerFamily: 'utility',
                executionSignature: {
                    schemaVersion: '2.0',
                    executionMode: 'utility',
                    intentKind: 'utility',
                    nodeType: '',
                    sessionType: '',
                },
            }],
        },
        {
            currentTimeMs: Date.parse('2026-09-01T00:00:00.000Z'),
        },
    );

    assert.deepEqual(getVisibleTools(state, {
        currentTimeMs: Date.parse('2026-09-01T00:00:00.000Z'),
    }), []);
    assert.deepEqual(getVisibleToolDefinitions(state, {
        currentTimeMs: Date.parse('2026-09-01T00:00:00.000Z'),
    }), {});
});

test('setRuntimeActiveTool rejects tools that are not registered', () => {
    const state = registerToolSource(initialToolRuntimeState, {
        source: 'graph',
        tools: ['select', 'shape'],
    });

    const next = setRuntimeActiveTool(state, 'rig-select');
    assert.equal(next, state);
});

test('unregisterToolSource repairs active tool when current tool disappears', () => {
    const state = {
        ...registerToolSource(initialToolRuntimeState, {
            source: 'graph',
            tools: ['select', 'shape'],
        }),
        activeTool: 'shape',
    };

    const next = unregisterToolSource(state, { source: 'graph' });
    assert.equal(next.activeTool, null);
    assert.deepEqual(getVisibleTools(next), []);
});

test('unregisterToolSource removes only the targeted source and preserves other synthesized sources', () => {
    const state = registerToolSource(
        registerToolSource(initialToolRuntimeState, {
            source: 'synth.graph',
            tools: ['shape'],
        }),
        {
            source: 'synth.viewport',
            tools: ['pan'],
        },
    );

    const next = unregisterToolSource(state, { source: 'synth.graph' });

    assert.deepEqual(next.registeredTools, {
        'synth.viewport': ['pan'],
    });
    assert.deepEqual(getVisibleTools(next), ['pan']);
});

test('unregisterToolSource preserves shared overlapping tools owned by surviving sources', () => {
    const state = {
        ...registerToolSource(
            registerToolSource(initialToolRuntimeState, {
                source: 'capability.alpha',
                tools: ['move', 'shape'],
            }),
            {
                source: 'capability.beta',
                tools: ['frame', 'move'],
            },
        ),
        activeTool: 'move',
    };

    const next = unregisterToolSource(state, { source: 'capability.alpha' });

    assert.equal(next.activeTool, 'move');
    assert.deepEqual(getVisibleTools(next), ['frame', 'move']);
    assert.deepEqual(getVisibleToolOwnership(next), {
        frame: ['capability.beta'],
        move: ['capability.beta'],
    });
});

test('unregisterToolSource repairs active synthesized tool to canonical fallback order', () => {
    const state = {
        ...registerToolSource(
            registerToolSource(initialToolRuntimeState, {
                source: 'b-source',
                tools: ['zoom'],
            }),
            {
                source: 'a-source',
                tools: ['pan'],
            },
        ),
        activeTool: 'zoom',
    };

    const next = unregisterToolSource(state, { source: 'b-source' });

    assert.equal(next.activeTool, 'pan');
    assert.deepEqual(getVisibleTools(next), ['pan']);
});

test('unregisterToolSource is idempotent for the same source', () => {
    const state = registerToolSource(initialToolRuntimeState, {
        source: 'synth.graph',
        tools: ['shape'],
    });

    const once = unregisterToolSource(state, { source: 'synth.graph' });
    const twice = unregisterToolSource(once, { source: 'synth.graph' });

    assert.deepEqual(twice, once);
});

test('resolveCanonicalActiveTool preserves current tool or falls back deterministically', () => {
    assert.equal(resolveCanonicalActiveTool('select', ['select', 'pan']), 'select');
    assert.equal(resolveCanonicalActiveTool('shape', ['pan', 'zoom']), 'pan');
    assert.equal(resolveCanonicalActiveTool('shape', []), null);
});

test('resolveCanonicalActiveTool prefers semantic defaultActive tool when current tool is no longer visible', () => {
    assert.equal(
        resolveCanonicalActiveTool(
            'shape',
            ['move', 'pan'],
            {
                move: {
                    id: 'move',
                    winnerSource: 'capability.alpha',
                    winnerPriority: 100,
                    descriptor: { id: 'move', defaultActive: false },
                },
                pan: {
                    id: 'pan',
                    winnerSource: 'capability.viewport',
                    winnerPriority: 50,
                    descriptor: { id: 'pan', defaultActive: true },
                },
            },
        ),
        'pan',
    );
});
