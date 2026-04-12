import test from 'node:test';
import assert from 'node:assert/strict';

import { clampTransitionDuration } from '@/runtime/interaction/shotTransitionConstraints.js';

test('clampTransitionDuration clamps to the shorter neighboring shot duration', () => {
    const result = clampTransitionDuration({
        durationMs: 900,
        fromShot: { startMs: 0, endMs: 600 },
        toShot: { startMs: 600, endMs: 1000 },
    });

    assert.equal(result, 400);
});

test('clampTransitionDuration accepts canonical start/duration shot shape', () => {
    const result = clampTransitionDuration({
        durationMs: 250,
        fromShot: { start: 0, duration: 1000 },
        toShot: { start: 1000, duration: 500 },
    });

    assert.equal(result, 250);
});

test('clampTransitionDuration never returns a negative number', () => {
    const result = clampTransitionDuration({
        durationMs: -50,
        fromShot: { startMs: 0, endMs: 600 },
        toShot: { startMs: 600, endMs: 1000 },
    });

    assert.equal(result, 0);
});
