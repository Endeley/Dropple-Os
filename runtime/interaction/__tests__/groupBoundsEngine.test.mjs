import test from 'node:test';
import assert from 'node:assert/strict';
import { computeGroupBounds } from '@/runtime/interaction/groupBoundsEngine.js';

test('group bounds are deterministic regardless of node id input order', () => {
    const nodes = {
        a: { x: 0, y: 0, width: 100, height: 100 },
        b: { x: 200, y: 100, width: 50, height: 50 },
    };

    const resultA = computeGroupBounds(nodes, ['a', 'b']);
    const resultB = computeGroupBounds(nodes, ['b', 'a']);

    assert.deepEqual(resultA, resultB);
    assert.deepEqual(resultA, {
        x: 0,
        y: 0,
        width: 250,
        height: 150,
        center: {
            x: 125,
            y: 75,
        },
    });
});
