import test from 'node:test';
import assert from 'node:assert/strict';

import { computeResizeAnchors } from '@/runtime/transforms/computeResizeAnchors.js';
import { computeRotateAnchor, ROTATE_OFFSET } from '@/runtime/transforms/computeRotateAnchor.js';
import { computeTransformAnchor } from '@/runtime/transforms/computeTransformAnchor.js';
import { transformAnchorProjection } from '@/runtime/transforms/transformAnchorProjection.js';

test('center pivot is selection center', () => {
    assert.deepEqual(
        computeTransformAnchor({ x: 0, y: 0, width: 100, height: 100 }),
        { x: 50, y: 50 },
    );
});

test('resize anchors resolve to the eight handle positions', () => {
    assert.deepEqual(
        computeResizeAnchors({ x: 0, y: 0, width: 100, height: 100 }),
        {
            n: { x: 50, y: 0 },
            ne: { x: 100, y: 0 },
            e: { x: 100, y: 50 },
            se: { x: 100, y: 100 },
            s: { x: 50, y: 100 },
            sw: { x: 0, y: 100 },
            w: { x: 0, y: 50 },
            nw: { x: 0, y: 0 },
        },
    );
});

test('rotate anchor sits above the top edge by the standard offset', () => {
    assert.deepEqual(
        computeRotateAnchor({ x: 0, y: 10, width: 100, height: 100 }),
        { x: 50, y: 10 - ROTATE_OFFSET },
    );
});

test('null bounds produce null anchors', () => {
    assert.deepEqual(transformAnchorProjection({ bounds: null, center: null }), {
        pivot: null,
        resizeAnchors: null,
        rotateAnchor: null,
    });
});

test('transform anchor projection derives all handles from selection bounds', () => {
    const projection = transformAnchorProjection({
        bounds: { x: 10, y: 20, width: 80, height: 40 },
        center: { x: 50, y: 40 },
    });

    assert.deepEqual(projection, {
        pivot: { x: 50, y: 40 },
        resizeAnchors: {
            n: { x: 50, y: 20 },
            ne: { x: 90, y: 20 },
            e: { x: 90, y: 40 },
            se: { x: 90, y: 60 },
            s: { x: 50, y: 60 },
            sw: { x: 10, y: 60 },
            w: { x: 10, y: 40 },
            nw: { x: 10, y: 20 },
        },
        rotateAnchor: { x: 50, y: -4 },
    });
    assert.equal(Object.isFrozen(projection), true);
    assert.equal(Object.isFrozen(projection.pivot), true);
    assert.equal(Object.isFrozen(projection.resizeAnchors), true);
    assert.equal(Object.isFrozen(projection.rotateAnchor), true);
});
