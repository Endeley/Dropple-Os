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
    assert.deepEqual(getVisibleTools(next), ['select', 'pan', 'shape', 'cut']);
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

    assert.deepEqual(getVisibleTools(state), ['move', 'shape', 'frame']);
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
            descriptors: [{ id: 'move', label: 'Beta Move', group: 'edit' }],
        }),
        {
            source: 'capability.alpha',
            tools: ['move'],
            priority: 100,
            descriptors: [{ id: 'move', label: 'Alpha Move', group: 'edit' }],
        },
    );

    assert.deepEqual(getVisibleToolDefinitions(state).move, {
        id: 'move',
        owners: ['capability.alpha', 'capability.beta'],
        winnerSource: 'capability.alpha',
        descriptor: { id: 'move', label: 'Alpha Move', group: 'edit' },
    });
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
