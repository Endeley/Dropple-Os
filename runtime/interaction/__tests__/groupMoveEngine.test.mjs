import test from 'node:test';
import assert from 'node:assert/strict';
import { computeGroupMoveUpdates } from '@/runtime/interaction/groupMoveEngine.js';

test('group move applies same delta to all members', () => {
    const group = {
        nodeIds: ['a', 'b'],
        bounds: { x: 0, y: 0, width: 140, height: 60 },
        members: {
            a: {
                originBounds: { x: 0, y: 0 },
                offsetFromGroupOrigin: { x: 0, y: 0 },
            },
            b: {
                originBounds: { x: 100, y: 50 },
                offsetFromGroupOrigin: { x: 100, y: 50 },
            },
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
        nodeIds: ['a', 'b'],
        bounds: { x: 0, y: 0, width: 140, height: 60 },
        members: {
            a: {
                originBounds: { x: 0, y: 0 },
                offsetFromGroupOrigin: { x: 0, y: 0 },
            },
            b: {
                originBounds: { x: 100, y: 50 },
                offsetFromGroupOrigin: { x: 100, y: 50 },
            },
        },
    };

    const resultA = computeGroupMoveUpdates(group, { dx: 5, dy: 5 });
    const resultB = computeGroupMoveUpdates(group, { dx: 5, dy: 5 });

    assert.deepEqual(resultA, resultB);
});

test('group move works with runtime group shape that does not include active', () => {
    const group = {
        nodeIds: ['a', 'b'],
        bounds: { x: 10, y: 20, width: 140, height: 60 },
        members: {
            a: {
                originBounds: { x: 10, y: 20 },
                offsetFromGroupOrigin: { x: 0, y: 0 },
            },
            b: {
                originBounds: { x: 110, y: 70 },
                offsetFromGroupOrigin: { x: 100, y: 50 },
            },
        },
    };

    const result = computeGroupMoveUpdates(group, { dx: 15, dy: -5 });

    assert.deepEqual(result, [
        { nodeId: 'a', x: 25, y: 15 },
        { nodeId: 'b', x: 125, y: 65 },
    ]);
});
