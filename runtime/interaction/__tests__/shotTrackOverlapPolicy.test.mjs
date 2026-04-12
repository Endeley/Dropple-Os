import test from 'node:test';
import assert from 'node:assert/strict';

import {
    clampShotMoveWithinTrack,
    clampShotResizeWithinTrack,
} from '@/runtime/interaction/shotTrackOverlapPolicy.js';

const SHOTS = [
    { id: 'shot-a', startMs: 0, endMs: 1000 },
    { id: 'shot-b', startMs: 1000, endMs: 2000 },
    { id: 'shot-c', startMs: 2500, endMs: 3000 },
];

test('clampShotMoveWithinTrack shrinks into the available gap when duration does not fit', () => {
    const result = clampShotMoveWithinTrack({
        shots: SHOTS,
        shotId: 'shot-a',
        startMs: 1200,
        endMs: 2200,
    });

    assert.deepEqual(result, {
        startMs: 2000,
        endMs: 2500,
    });
});

test('clampShotResizeWithinTrack prevents left resize from crossing the previous shot', () => {
    const result = clampShotResizeWithinTrack({
        shots: SHOTS,
        shotId: 'shot-b',
        startMs: 500,
        endMs: 2000,
        edge: 'left',
    });

    assert.deepEqual(result, {
        startMs: 1000,
        endMs: 2000,
    });
});

test('clampShotResizeWithinTrack prevents right resize from crossing the next shot', () => {
    const result = clampShotResizeWithinTrack({
        shots: SHOTS,
        shotId: 'shot-b',
        startMs: 1000,
        endMs: 2600,
        edge: 'right',
    });

    assert.deepEqual(result, {
        startMs: 1000,
        endMs: 2500,
    });
});
