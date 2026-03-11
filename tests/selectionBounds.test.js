import test from 'node:test';
import assert from 'node:assert/strict';

import { computeSelectionBounds } from '@/runtime/selectionBounds/computeSelectionBounds.js';
import { getSelectionNodes } from '@/runtime/selectionBounds/getSelectionNodes.js';
import { selectionBoundsProjection } from '@/runtime/selectionBounds/selectionBoundsProjection.js';
import { unionBounds } from '@/runtime/selectionBounds/unionBounds.js';

function createRuntime({ ids = [], computed = {} } = {}) {
    return {
        selection: {
            ids: new Set(ids),
            primary: ids[0] ?? null,
        },
        scene: {
            computed,
        },
    };
}

test('getSelectionNodes resolves selected computed nodes in selection order', () => {
    const runtime = createRuntime({
        ids: ['B', 'A'],
        computed: {
            A: { id: 'A', worldBounds: { x: 0, y: 0, width: 10, height: 10 } },
            B: { id: 'B', worldBounds: { x: 20, y: 0, width: 10, height: 10 } },
        },
    });

    assert.deepEqual(
        getSelectionNodes(runtime).map((node) => node.id),
        ['B', 'A'],
    );
});

test('single node selection returns that node bounds', () => {
    const runtime = createRuntime({
        ids: ['A'],
        computed: {
            A: { id: 'A', worldBounds: { x: 5, y: 8, width: 100, height: 80 } },
        },
    });

    assert.deepEqual(computeSelectionBounds(runtime), {
        x: 5,
        y: 8,
        width: 100,
        height: 80,
    });
});

test('two nodes union into one bounding box', () => {
    const runtime = createRuntime({
        ids: ['A', 'B'],
        computed: {
            A: { id: 'A', worldBounds: { x: 0, y: 0, width: 100, height: 100 } },
            B: { id: 'B', worldBounds: { x: 200, y: 0, width: 100, height: 100 } },
        },
    });

    assert.deepEqual(computeSelectionBounds(runtime), {
        x: 0,
        y: 0,
        width: 300,
        height: 100,
    });
});

test('overlapping nodes union correctly', () => {
    assert.deepEqual(
        unionBounds([
            { x: 0, y: 0, width: 100, height: 100 },
            { x: 50, y: 40, width: 100, height: 100 },
        ]),
        {
            x: 0,
            y: 0,
            width: 150,
            height: 140,
        },
    );
});

test('empty selection returns null bounds', () => {
    const runtime = createRuntime();

    assert.equal(computeSelectionBounds(runtime), null);
});

test('selection bounds projection returns bounds and center for UI', () => {
    const runtime = createRuntime({
        ids: ['A', 'B'],
        computed: {
            A: { id: 'A', worldBounds: { x: 0, y: 0, width: 100, height: 100 } },
            B: { id: 'B', worldBounds: { x: 200, y: 0, width: 100, height: 100 } },
        },
    });

    const projection = selectionBoundsProjection(runtime);

    assert.deepEqual(projection, {
        bounds: {
            x: 0,
            y: 0,
            width: 300,
            height: 100,
        },
        center: {
            x: 150,
            y: 50,
        },
    });
    assert.equal(Object.isFrozen(projection), true);
    assert.equal(Object.isFrozen(projection.bounds), true);
    assert.equal(Object.isFrozen(projection.center), true);
});
