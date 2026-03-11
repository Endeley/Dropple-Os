import test from 'node:test';
import assert from 'node:assert/strict';

import { hitTestPoint, hitTestBounds, resolveHitTest } from '@/runtime/hitTest/index.js';
import { buildSpatialIndex } from '@/runtime/spatial/index.js';

test('hit testing resolves top node deterministically', () => {
    const runtime = {
        document: {
            nodes: {
                a: {},
                b: {},
            },
        },
        scene: {
            computed: {
                a: { x: 0, y: 0, width: 100, height: 100, zIndex: 1 },
                b: { x: 0, y: 0, width: 100, height: 100, zIndex: 2 },
            },
        },
    };

    runtime.scene.spatialIndex = buildSpatialIndex(runtime.scene, 64);

    const hit = hitTestPoint({
        runtime,
        x: 10,
        y: 10,
    });

    assert.equal(hit, 'b');
});

test('bounds hit testing filters hidden nodes', () => {
    const runtime = {
        document: {
            nodes: {
                a: {},
                b: { hidden: true },
            },
        },
        scene: {
            computed: {
                a: { x: 0, y: 0, width: 100, height: 100, zIndex: 1 },
                b: { x: 0, y: 0, width: 100, height: 100, zIndex: 2 },
            },
        },
    };

    runtime.scene.spatialIndex = buildSpatialIndex(runtime.scene, 64);

    const hits = hitTestBounds({
        runtime,
        rect: { x: 0, y: 0, width: 50, height: 50 },
    });

    assert.deepEqual(hits, ['a']);
});

test('resolveHitTest dispatches to point and bounds handlers', () => {
    const runtime = {
        document: {
            nodes: {
                a: {},
            },
        },
        scene: {
            computed: {
                a: { x: 0, y: 0, width: 100, height: 100, zIndex: 1 },
            },
        },
    };

    runtime.scene.spatialIndex = buildSpatialIndex(runtime.scene, 64);

    assert.equal(
        resolveHitTest({
            runtime,
            type: 'point',
            payload: { x: 10, y: 10 },
        }),
        'a',
    );

    assert.deepEqual(
        resolveHitTest({
            runtime,
            type: 'bounds',
            payload: { rect: { x: 0, y: 0, width: 20, height: 20 } },
        }),
        ['a'],
    );
});

test('hit testing narrows candidates by visible partitions when nodeToPartition is available', () => {
    const runtime = {
        workspace: {
            viewport: { x: 0, y: 0, width: 200, height: 200 },
        },
        document: {
            nodes: {
                a: {},
                b: {},
            },
        },
        scene: {
            nodeToPartition: new Map([
                ['a', 'p0'],
                ['b', 'p1'],
            ]),
            partitions: new Map([
                ['p0', { id: 'p0', bounds: { x: 0, y: 0, width: 100, height: 100 } }],
                ['p1', { id: 'p1', bounds: { x: 500, y: 500, width: 100, height: 100 } }],
            ]),
            computed: {
                a: { x: 0, y: 0, width: 100, height: 100, zIndex: 1 },
                b: { x: 0, y: 0, width: 100, height: 100, zIndex: 2 },
            },
        },
    };

    runtime.scene.spatialIndex = buildSpatialIndex(runtime.scene, 64);

    const hit = hitTestPoint({
        runtime,
        x: 10,
        y: 10,
    });

    assert.equal(hit, 'a');
});
