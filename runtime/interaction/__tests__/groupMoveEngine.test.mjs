import test from 'node:test';
import assert from 'node:assert/strict';
import { computeGroupMoveUpdates } from '@/runtime/interaction/groupMoveEngine.js';

test('group move applies same delta to all members', () => {
    const group = {
        active: true,
        nodeIds: ['a', 'b'],
        members: {
            a: { originBounds: { x: 0, y: 0 } },
            b: { originBounds: { x: 100, y: 50 } },
        },
    };

    const result = computeGroupMoveUpdates(group, { dx: 10, dy: 20 });

    assert.deepEqual(result, [
        { nodeId: 'a', x: 10, y: 20 },
        { nodeId: 'b', x: 110, y: 70 },
    ]);
});

test('group move is deterministic', () => {
    const group = {
        active: true,
        nodeIds: ['a', 'b'],
        members: {
            a: { originBounds: { x: 0, y: 0 } },
            b: { originBounds: { x: 100, y: 50 } },
        },
    };

    const resultA = computeGroupMoveUpdates(group, { dx: 5, dy: 5 });
    const resultB = computeGroupMoveUpdates(group, { dx: 5, dy: 5 });

    assert.deepEqual(resultA, resultB);
});
