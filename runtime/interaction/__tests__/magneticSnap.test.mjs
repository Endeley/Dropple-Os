import test from 'node:test';
import assert from 'node:assert/strict';
import {
    applyMagneticSnap,
    computeVelocity,
} from '@/runtime/interaction/magneticSnap.js';

test('computeVelocity returns deterministic speed', () => {
    const velocity = computeVelocity(
        { x: 10, y: 10 },
        { x: 13, y: 14 },
    );

    assert.deepEqual(velocity, {
        vx: 3,
        vy: 4,
        speed: 5,
    });
});

test('applyMagneticSnap blends raw and resolved deltas', () => {
    const result = applyMagneticSnap(
        { dx: 14, dy: 0 },
        { dx: 20, dy: 0 },
        {
            threshold: 10,
            minStrength: 0.2,
            maxStrength: 1,
            velocity: { speed: 0 },
            velocityFalloff: 0.06,
        },
    );

    assert.ok(result.dx > 14);
    assert.ok(result.dx < 20);
    assert.equal(result.dy, 0);
});

test('applyMagneticSnap weakens with velocity', () => {
    const slow = applyMagneticSnap(
        { dx: 14, dy: 0 },
        { dx: 20, dy: 0 },
        {
            threshold: 10,
            minStrength: 0.2,
            velocity: { speed: 0 },
            velocityFalloff: 0.06,
        },
    );

    const fast = applyMagneticSnap(
        { dx: 14, dy: 0 },
        { dx: 20, dy: 0 },
        {
            threshold: 10,
            minStrength: 0.2,
            velocity: { speed: 10 },
            velocityFalloff: 0.06,
        },
    );

    assert.ok(slow.dx > fast.dx);
});
