import {
    collectShotSnapTargets,
    resolveShotDragSnap,
    resolveShotResizeLeftSnap,
    resolveShotResizeRightSnap,
} from '@/runtime/interaction/shotSnapEngine.js';
import {
    clampShotMoveWithinTrack,
    clampShotResizeWithinTrack,
} from '@/runtime/interaction/shotTrackOverlapPolicy.js';

function safeNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

export function resolveTrackIndexFromOffset(offsetY, { trackCount, trackHeight, trackGap } = {}) {
    const count = Math.max(0, safeNumber(trackCount, 0));
    if (count === 0) return -1;

    const laneSize = Math.max(1, safeNumber(trackHeight, 0) + safeNumber(trackGap, 0));
    const rawIndex = Math.floor(Math.max(0, safeNumber(offsetY, 0)) / laneSize);
    return Math.max(0, Math.min(count - 1, rawIndex));
}

export function resolveTrackFromPointer({
    tracks = [],
    pointerClientY,
    containerTopPx,
    trackHeight,
    trackGap,
} = {}) {
    const index = resolveTrackIndexFromOffset(safeNumber(pointerClientY) - safeNumber(containerTopPx), {
        trackCount: tracks.length,
        trackHeight,
        trackGap,
    });

    return index >= 0 ? tracks[index] ?? null : null;
}

function resolveSnapContext({
    tracks,
    targetTrackId,
    excludeShotId,
    playheadMs,
    gridSizeMs,
} = {}) {
    const track = Array.isArray(tracks) ? tracks.find((entry) => entry?.id === targetTrackId) ?? null : null;
    return collectShotSnapTargets({
        shots: track?.shots ?? [],
        excludeShotId,
        playheadMs,
        gridSizeMs,
    });
}

export function computeShotDragPreview({
    shot,
    tracks,
    sourceTrackId,
    pointerClientY,
    containerTopPx,
    trackHeight,
    trackGap,
    deltaMs,
    playheadMs,
    gridSizeMs = 100,
    thresholdMs = 20,
} = {}) {
    const targetTrack =
        resolveTrackFromPointer({
            tracks,
            pointerClientY,
            containerTopPx,
            trackHeight,
            trackGap,
        }) ??
        (Array.isArray(tracks) ? tracks.find((track) => track?.id === sourceTrackId) ?? null : null);

    const context = resolveSnapContext({
        tracks,
        targetTrackId: targetTrack?.id ?? sourceTrackId,
        excludeShotId: shot?.id,
        playheadMs,
        gridSizeMs,
    });

    const rawStartMs = safeNumber(shot?.startMs) + safeNumber(deltaMs);
    const rawEndMs = safeNumber(shot?.endMs) + safeNumber(deltaMs);
    const snapped = resolveShotDragSnap({
        startMs: rawStartMs,
        endMs: rawEndMs,
        context,
        thresholdMs,
    });
    const clamped =
        targetTrack?.id === sourceTrackId
            ? clampShotMoveWithinTrack({
                  shots: targetTrack?.shots ?? [],
                  shotId: shot?.id,
                  startMs: snapped.startMs,
                  endMs: snapped.endMs,
              })
            : snapped;

    return {
        ...clamped,
        guides: snapped.guides ?? [],
        targetTrackId: targetTrack?.id ?? sourceTrackId ?? null,
    };
}

export function computeShotResizePreview({
    shot,
    edge = 'right',
    tracks,
    sourceTrackId,
    deltaMs,
    playheadMs,
    gridSizeMs = 100,
    thresholdMs = 20,
} = {}) {
    const context = resolveSnapContext({
        tracks,
        targetTrackId: sourceTrackId,
        excludeShotId: shot?.id,
        playheadMs,
        gridSizeMs,
    });

    const startMs = safeNumber(shot?.startMs);
    const endMs = safeNumber(shot?.endMs);

    const raw =
        edge === 'left'
            ? {
                  startMs: startMs + safeNumber(deltaMs),
                  endMs,
              }
            : {
                  startMs,
                  endMs: endMs + safeNumber(deltaMs),
              };

    const snapped =
        edge === 'left'
            ? resolveShotResizeLeftSnap({
                  ...raw,
                  context,
                  thresholdMs,
              })
            : resolveShotResizeRightSnap({
                  ...raw,
                  context,
                  thresholdMs,
              });
    const clamped = clampShotResizeWithinTrack({
        shots: Array.isArray(tracks)
            ? tracks.find((track) => track?.id === sourceTrackId)?.shots ?? []
            : [],
        shotId: shot?.id,
        startMs: snapped.startMs,
        endMs: snapped.endMs,
        edge,
    });

    return {
        ...clamped,
        guides: snapped.guides ?? [],
        targetTrackId: sourceTrackId ?? null,
    };
}
