import test from 'node:test';
import assert from 'node:assert/strict';

import {
    collectShotSnapTargets,
    resolveShotDragSnap,
    resolveShotResizeLeftSnap,
    resolveShotResizeRightSnap,
} from '@/runtime/interaction/shotSnapEngine.js';

test('collectShotSnapTargets collects deterministic neighbor and playhead targets', () => {
    const result = collectShotSnapTargets({
        shots: [
            { id: 'shot-b', startMs: 1000, endMs: 2000 },
            { id: 'shot-a', start: 0, duration: 1000 },
        ],
        excludeShotId: 'shot-a',
        playheadMs: 750,
        gridSizeMs: 50,
    });

    assert.deepEqual(result, {
        targets: [
            { type: 'playhead', value: 750, shotId: null },
            { type: 'shot-start', value: 1000, shotId: 'shot-b' },
            { type: 'shot-end', value: 2000, shotId: 'shot-b' },
        ],
        gridSizeMs: 50,
    });
});

test('resolveShotDragSnap snaps to neighboring shot edges', () => {
    const context = collectShotSnapTargets({
        shots: [{ id: 'shot-b', startMs: 1000, endMs: 2000 }],
        gridSizeMs: 0,
    });

    const result = resolveShotDragSnap({
        startMs: 10,
        endMs: 990,
        context,
        thresholdMs: 20,
    });

    assert.deepEqual(result, {
        startMs: 20,
        endMs: 1000,
        guides: [
            {
                type: 'shot-start',
                value: 1000,
                shotId: 'shot-b',
                snapped: 1000,
                dist: 10,
                anchor: 'end',
            },
        ],
    });
});

test('resolveShotDragSnap prefers neighbor targets over closer grid targets', () => {
    const context = collectShotSnapTargets({
        shots: [{ id: 'shot-b', startMs: 1000, endMs: 2000 }],
        gridSizeMs: 50,
    });

    const result = resolveShotDragSnap({
        startMs: 8,
        endMs: 992,
        context,
        thresholdMs: 20,
    });

    assert.equal(result.startMs, 16);
    assert.equal(result.endMs, 1000);
    assert.equal(result.guides[0]?.type, 'shot-start');
    assert.equal(result.guides[0]?.anchor, 'end');
});

test('resolveShotResizeRightSnap snaps to grid lines', () => {
    const context = collectShotSnapTargets({
        shots: [],
        gridSizeMs: 50,
    });

    const result = resolveShotResizeRightSnap({
        startMs: 0,
        endMs: 102,
        context,
        thresholdMs: 10,
    });

    assert.deepEqual(result, {
        startMs: 0,
        endMs: 100,
        guides: [
            {
                type: 'grid',
                value: 100,
                snapped: 100,
                dist: 2,
                anchor: 'end',
            },
        ],
    });
});

test('resolveShotResizeLeftSnap snaps to the playhead', () => {
    const context = collectShotSnapTargets({
        shots: [],
        playheadMs: 500,
        gridSizeMs: 50,
    });

    const result = resolveShotResizeLeftSnap({
        startMs: 492,
        endMs: 900,
        context,
        thresholdMs: 10,
    });

    assert.deepEqual(result, {
        startMs: 500,
        endMs: 900,
        guides: [
            {
                type: 'playhead',
                value: 500,
                shotId: null,
                snapped: 500,
                dist: 8,
                anchor: 'start',
            },
        ],
    });
});

test('shot snapping is deterministic for repeated identical inputs', () => {
    const context = collectShotSnapTargets({
        shots: [{ id: 'shot-b', startMs: 1000, endMs: 2000 }],
        playheadMs: 500,
        gridSizeMs: 50,
    });

    const left = resolveShotDragSnap({
        startMs: 8,
        endMs: 992,
        context,
        thresholdMs: 20,
    });
    const right = resolveShotDragSnap({
        startMs: 8,
        endMs: 992,
        context,
        thresholdMs: 20,
    });

    assert.deepEqual(left, right);
});

test('shot snapping stays stable within threshold and does not jitter between targets', () => {
    const context = collectShotSnapTargets({
        shots: [{ id: 'shot-b', startMs: 1000, endMs: 2000 }],
        gridSizeMs: 50,
    });

    const first = resolveShotResizeRightSnap({
        startMs: 0,
        endMs: 993,
        context,
        thresholdMs: 20,
    });
    const second = resolveShotResizeRightSnap({
        startMs: 0,
        endMs: 994,
        context,
        thresholdMs: 20,
    });

    assert.equal(first.endMs, 1000);
    assert.equal(second.endMs, 1000);
    assert.equal(first.guides[0]?.type, 'shot-start');
    assert.equal(second.guides[0]?.type, 'shot-start');
});
