import test from 'node:test';
import assert from 'node:assert/strict';

import { computeAlignmentGuides } from '@/runtime/snapping/computeAlignmentGuides.js';
import { computeGridSnap } from '@/runtime/snapping/computeGridSnap.js';
import { computeSnapDelta } from '@/runtime/snapping/computeSnapDelta.js';
import { computeSnapTargets } from '@/runtime/snapping/computeSnapTargets.js';
import { computeMoveDelta } from '@/runtime/transforms/computeMoveDelta.js';

test('snap targets include edges and centers of scene nodes', () => {
    const targets = computeSnapTargets({
        A: { id: 'A', worldBounds: { x: 100, y: 50, width: 20, height: 10 } },
    });

    assert.deepEqual(targets, [
        { type: 'v', x: 100, nodeId: 'A' },
        { type: 'v', x: 110, nodeId: 'A' },
        { type: 'v', x: 120, nodeId: 'A' },
        { type: 'h', y: 50, nodeId: 'A' },
        { type: 'h', y: 55, nodeId: 'A' },
        { type: 'h', y: 60, nodeId: 'A' },
    ]);
});

test('snap delta aligns bounds to nearby target edge', () => {
    assert.deepEqual(
        computeSnapDelta(
            { x: 95, y: 0, width: 20, height: 20 },
            [{ type: 'v', x: 100 }],
        ),
        { snapX: 5, snapY: 0 },
    );
});

test('grid snap rounds delta to grid size', () => {
    assert.deepEqual(computeGridSnap({ dx: 11, dy: 15 }), {
        dx: 8,
        dy: 16,
    });
});

test('alignment guides are emitted for aligned bounds', () => {
    assert.deepEqual(
        computeAlignmentGuides(
            { x: 100, y: 50, width: 20, height: 20 },
            [{ type: 'v', x: 100 }, { type: 'h', y: 60 }],
        ),
        [{ type: 'v', x: 100 }, { type: 'h', y: 60 }],
    );
});

test('move delta remains deterministic for the same pointer path', () => {
    const run = () =>
        computeMoveDelta(
            { x: 0, y: 0 },
            { x: 95, y: 0 },
            { x: 0, y: 0, width: 20, height: 20 },
            [{ type: 'v', x: 100 }],
        );

    assert.deepEqual(run(), run());
});
