import test from 'node:test';
import assert from 'node:assert/strict';

import {
    computeShotDragPreview,
    computeShotResizePreview,
    resolveTrackFromPointer,
} from '@/runtime/interaction/shotTimelineInteraction.js';

const TRACKS = [
    {
        id: 'primary',
        shots: [
            { id: 'shot-a', startMs: 0, endMs: 1000 },
            { id: 'shot-b', startMs: 1000, endMs: 2000 },
        ],
    },
    {
        id: 'secondary',
        shots: [{ id: 'shot-c', startMs: 0, endMs: 500 }],
    },
];

test('resolveTrackFromPointer resolves the hovered track lane deterministically', () => {
    const result = resolveTrackFromPointer({
        tracks: TRACKS,
        pointerClientY: 45,
        containerTopPx: 0,
        trackHeight: 32,
        trackGap: 8,
    });

    assert.equal(result?.id, 'secondary');
});

test('computeShotDragPreview snaps inside the hovered target track', () => {
    const result = computeShotDragPreview({
        shot: { id: 'shot-a', startMs: 10, endMs: 1010 },
        tracks: TRACKS,
        sourceTrackId: 'primary',
        pointerClientY: 45,
        containerTopPx: 0,
        trackHeight: 32,
        trackGap: 8,
        deltaMs: 0,
        playheadMs: null,
        gridSizeMs: 100,
        thresholdMs: 20,
    });

    assert.equal(result.targetTrackId, 'secondary');
    assert.equal(result.startMs, 0);
    assert.equal(result.endMs, 1000);
});

test('computeShotResizePreview snaps resize against the source track', () => {
    const result = computeShotResizePreview({
        shot: { id: 'shot-b', startMs: 1000, endMs: 1493 },
        tracks: TRACKS,
        sourceTrackId: 'primary',
        edge: 'right',
        deltaMs: 0,
        playheadMs: 1500,
        gridSizeMs: 100,
        thresholdMs: 10,
    });

    assert.equal(result.targetTrackId, 'primary');
    assert.equal(result.endMs, 1500);
});
