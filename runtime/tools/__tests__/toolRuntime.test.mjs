import test from 'node:test';
import assert from 'node:assert/strict';
import {
    getVisibleTools,
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
