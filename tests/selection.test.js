import test from 'node:test';
import assert from 'node:assert/strict';

import { buildSpatialIndex } from '@/runtime/spatial/index.js';
import { clearSelection } from '@/runtime/selection/clearSelection.js';
import { selectBounds } from '@/runtime/selection/selectBounds.js';
import { selectNode } from '@/runtime/selection/selectNode.js';
import { selectionProjection } from '@/runtime/selection/selectionProjection.js';
import { selectionReducer } from '@/runtime/selection/selectionReducer.js';
import { toggleNode } from '@/runtime/selection/toggleNode.js';
import { validateSelection } from '@/runtime/selection/validateSelection.js';

function createRuntime(overrides = {}) {
    const runtime = {
        selection: {
            ids: new Set(),
            primary: null,
        },
        document: {
            nodes: {},
        },
        scene: {
            computed: {},
            spatialIndex: null,
        },
        ...overrides,
    };

    return runtime;
}

test('single select sets one selected id and primary', () => {
    const runtime = createRuntime();
    const next = selectionReducer(runtime, selectNode('A'));

    assert.deepEqual(Array.from(next.selection.ids), ['A']);
    assert.equal(next.selection.primary, 'A');
    assert.equal(validateSelection(next.selection), true);
});

test('toggle adds a second node while preserving primary', () => {
    const runtime = selectionReducer(createRuntime(), selectNode('A'));
    const next = selectionReducer(runtime, toggleNode('B'));

    assert.deepEqual(Array.from(next.selection.ids), ['A', 'B']);
    assert.equal(next.selection.primary, 'A');
});

test('toggle off removes a node and repairs primary', () => {
    const withA = selectionReducer(createRuntime(), selectNode('A'));
    const withAB = selectionReducer(withA, toggleNode('B'));
    const next = selectionReducer(withAB, toggleNode('A'));

    assert.deepEqual(Array.from(next.selection.ids), ['B']);
    assert.equal(next.selection.primary, 'B');
});

test('clear selection empties runtime selection state', () => {
    const runtime = selectionReducer(createRuntime(), selectNode('A'));
    const next = selectionReducer(runtime, clearSelection());

    assert.deepEqual(Array.from(next.selection.ids), []);
    assert.equal(next.selection.primary, null);
});

test('marquee selection uses spatial index hits deterministically', () => {
    const runtime = createRuntime({
        document: {
            nodes: {
                A: {},
                B: {},
                C: {},
            },
        },
        scene: {
            computed: {
                A: { x: 0, y: 0, width: 50, height: 50 },
                B: { x: 60, y: 0, width: 50, height: 50 },
                C: { x: 120, y: 0, width: 50, height: 50 },
            },
            spatialIndex: null,
        },
    });

    runtime.scene.spatialIndex = buildSpatialIndex(runtime.scene, 64);

    const next = selectionReducer(
        runtime,
        selectBounds(runtime, { x: 0, y: 0, width: 200, height: 60 }),
    );

    assert.deepEqual(Array.from(next.selection.ids), ['A', 'B', 'C']);
    assert.equal(next.selection.primary, 'A');
});

test('selection projection is immutable and UI-friendly', () => {
    const runtime = selectionReducer(createRuntime(), selectNode('A'));
    const projection = selectionProjection(runtime);

    assert.deepEqual(projection, {
        ids: ['A'],
        primary: 'A',
        count: 1,
    });
    assert.equal(Object.isFrozen(projection), true);
    assert.equal(Object.isFrozen(projection.ids), true);
});
