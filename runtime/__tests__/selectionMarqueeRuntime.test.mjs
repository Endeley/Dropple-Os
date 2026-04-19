import test from 'node:test';
import assert from 'node:assert/strict';

import { buildSpatialIndex } from '@/runtime/spatial/index.js';
import { resolveBoundsSelection } from '@/runtime/selection/selectBounds.js';

function createRuntime(overrides = {}) {
    return {
        document: {
            sceneGraph: {
                nodes: {},
                rootIds: [],
            },
            nodes: {},
        },
        scene: {
            computed: {},
            spatialIndex: null,
        },
        ...overrides,
    };
}

test('resolveBoundsSelection preserves deterministic ordered hits while using spatial bounds candidates', () => {
    const runtime = createRuntime({
        document: {
            sceneGraph: {
                nodes: {
                    b: { id: 'b', layout: { x: 120, y: 20, width: 40, height: 40 } },
                    a: { id: 'a', layout: { x: 20, y: 20, width: 40, height: 40 } },
                },
                rootIds: ['a', 'b'],
            },
            nodes: {},
        },
        scene: {
            computed: {
                b: { worldBounds: { x: 120, y: 20, width: 40, height: 40 } },
                a: { worldBounds: { x: 20, y: 20, width: 40, height: 40 } },
            },
            spatialIndex: null,
        },
    });

    runtime.scene.spatialIndex = buildSpatialIndex(runtime.scene, 64);

    const selection = resolveBoundsSelection(runtime, {
        x: 0,
        y: 0,
        width: 200,
        height: 100,
    });

    assert.deepEqual(selection.ids, ['a', 'b']);
    assert.equal(selection.primary, 'a');
    assert.deepEqual(selection.hitIds, ['a', 'b']);
});

test('resolveBoundsSelection falls back to manual bounds when spatial index is unavailable', () => {
    const runtime = createRuntime({
        document: {
            sceneGraph: {
                nodes: {
                    a: { id: 'a', layout: { x: 40, y: 50, width: 60, height: 30 } },
                },
                rootIds: ['a'],
            },
            nodes: {},
        },
        scene: {
            computed: {},
            spatialIndex: null,
        },
    });

    const selection = resolveBoundsSelection(runtime, {
        x: 0,
        y: 0,
        width: 200,
        height: 200,
    });

    assert.deepEqual(selection.ids, ['a']);
    assert.equal(selection.primary, 'a');
    assert.deepEqual(selection.hitIds, ['a']);
});

test('resolveBoundsSelection ignores degenerate scene placeholders when authored layout bounds are valid', () => {
    const runtime = createRuntime({
        document: {
            sceneGraph: {
                nodes: {
                    a: { id: 'a' },
                },
                rootIds: ['a'],
            },
            layout: {
                nodes: {
                    a: { x: 40, y: 50, width: 60, height: 30 },
                },
                computed: {
                    a: { x: 40, y: 50, width: 60, height: 30 },
                },
            },
            nodes: {},
        },
        scene: {
            computed: {
                a: {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                    worldBounds: { x: 0, y: 0, width: 0, height: 0 },
                },
            },
            spatialIndex: null,
        },
    });

    const selection = resolveBoundsSelection(runtime, {
        x: 0,
        y: 0,
        width: 200,
        height: 200,
    });

    assert.deepEqual(selection.ids, ['a']);
    assert.equal(selection.primary, 'a');
    assert.deepEqual(selection.hitIds, ['a']);
});
