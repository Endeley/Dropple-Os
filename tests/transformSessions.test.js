import test from 'node:test';
import assert from 'node:assert/strict';

import { MoveSession } from '@/runtime/interactions/input/sessions/MoveSession.js';
import { ResizeSession } from '@/runtime/interactions/input/sessions/ResizeSession.js';
import { RotateSession } from '@/runtime/interactions/input/sessions/RotateSession.js';
import { computeMoveDelta } from '@/runtime/transforms/computeMoveDelta.js';
import { computeResizeDelta } from '@/runtime/transforms/computeResizeDelta.js';
import { computeRotationDelta } from '@/runtime/transforms/computeRotationDelta.js';

test('move delta is deterministic from pointer path', () => {
    assert.deepEqual(
        computeMoveDelta({ x: 0, y: 0 }, { x: 10, y: 5 }),
        { dx: 10, dy: 5 },
    );

    const session = new MoveSession({
        nodeIds: ['A'],
        startPointer: { x: 0, y: 0 },
    });

    assert.deepEqual(session.update({ x: 10, y: 5 }), { dx: 10, dy: 5 });
    assert.deepEqual(session.commit(), {
        type: 'move',
        nodeIds: ['A'],
        delta: { dx: 10, dy: 5 },
    });
});

test('resize delta computes deterministically for handles', () => {
    assert.deepEqual(
        computeResizeDelta(
            { x: 0, y: 0 },
            { x: 10, y: 5 },
            { x: 0, y: 0, width: 100, height: 100 },
            'se',
        ),
        {
            resize: { width: 10, height: 5 },
            delta: { x: 0, y: 0 },
            bounds: { x: 0, y: 0, width: 110, height: 105 },
        },
    );

    assert.deepEqual(
        computeResizeDelta(
            { x: 0, y: 0 },
            { x: 10, y: 5 },
            { x: 0, y: 0, width: 100, height: 100 },
            'nw',
        ),
        {
            resize: { width: -10, height: -5 },
            delta: { x: 10, y: 5 },
            bounds: { x: 10, y: 5, width: 90, height: 95 },
        },
    );
});

test('resize session commits the computed delta', () => {
    const session = new ResizeSession({
        nodeIds: ['A'],
        nodes: [{ id: 'A' }],
        startPointer: { x: 0, y: 0 },
        handle: 'se',
        bounds: { x: 0, y: 0, width: 100, height: 100 },
    });

    session.update({ x: 10, y: 5 });

    assert.deepEqual(session.commit(), {
        type: 'resize',
        nodeIds: ['A'],
        resize: { width: 10, height: 5 },
        delta: { x: 0, y: 0 },
        handle: 'se',
    });
});

test('rotate delta uses pivot geometry deterministically', () => {
    const delta = computeRotationDelta(
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 0 },
    );

    assert.equal(Math.round(delta.rotation * 1000) / 1000, 1.571);

    const session = new RotateSession({
        nodeIds: ['A'],
        startPointerWorld: { x: 1, y: 0 },
        pivot: { x: 0, y: 0 },
    });

    session.onPointerMove({ x: 0, y: 1 });
    assert.equal(Math.round(session.commit().rotationDelta * 1000) / 1000, 1.571);
});

test('same pointer path produces the same transform result', () => {
    function runMove() {
        const session = new MoveSession({
            nodeIds: ['A'],
            startPointer: { x: 0, y: 0 },
        });
        session.update({ x: 12, y: 7 });
        return session.commit();
    }

    assert.deepEqual(runMove(), runMove());
});
