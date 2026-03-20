import test from 'node:test';
import assert from 'node:assert/strict';
import {
    getVisibleTools,
    initialToolRuntimeState,
    registerToolSource,
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
