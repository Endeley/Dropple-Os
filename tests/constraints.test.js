import test from 'node:test';
import assert from 'node:assert/strict';

import { applyConstraints } from '@/runtime/constraints/applyConstraints.js';
import { computeConstraints } from '@/runtime/constraints/computeConstraints.js';
import { constraintProjection } from '@/runtime/constraints/constraintProjection.js';

test('center constraints reduce move delta toward parent center', () => {
    assert.deepEqual(
        computeConstraints(
            { id: 'A', constraints: { horizontal: 'center', vertical: 'center' } },
            { x: 0, y: 0, width: 300, height: 200 },
            { dx: 20, dy: 10 },
        ),
        { dx: 10, dy: 5 },
    );
});

test('aspect ratio constraint resolves missing resize dimension', () => {
    assert.deepEqual(
        computeConstraints(
            { id: 'A', layout: { constraints: { aspectRatio: 2 } } },
            { x: 0, y: 0, width: 300, height: 200 },
            { width: 40 },
        ),
        { width: 40, height: 20 },
    );
});

test('applyConstraints maps constrained deltas per node', () => {
    assert.deepEqual(
        applyConstraints(
            [{ id: 'A', constraints: { horizontal: 'center' } }],
            { x: 0, y: 0, width: 300, height: 200 },
            { dx: 20, dy: 10 },
        ),
        [{ id: 'A', delta: { dx: 10, dy: 10 } }],
    );
});

test('constraintProjection derives selected node constraints', () => {
    const projection = constraintProjection({
        selection: { ids: new Set(['A']) },
        nodes: {
            A: { id: 'A', layout: { constraints: { centerX: true } } },
        },
    });

    assert.deepEqual(projection, [
        { id: 'A', constraints: { centerX: true } },
    ]);
    assert.equal(Object.isFrozen(projection), true);
});
