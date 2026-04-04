import { sampleProperty } from './sampleTimeline.js';

/**
 * Pure frame sampler for runtime/property timelines.
 * Supports both object-backed tracks (`track.properties`) and
 * array-backed tracks (`targetId/property/keyframes`).
 */
export function evaluateTimelineFrame({ timeline, baseState, time }) {
    if (!timeline || !baseState) return baseState;

    const SNAP_MS = 16;
    const snappedTime = Math.round(time / SNAP_MS) * SNAP_MS;
    const nextNodes = { ...(baseState.nodes || {}) };

    for (const track of normalizeTracks(timeline.tracks)) {
        const targetId = track?.nodeId ?? track?.targetId ?? null;
        const node = targetId ? nextNodes[targetId] : null;
        if (!node || !targetId) continue;

        const patch = sampleTrackPatch(track, snappedTime);
        if (!patch || Object.keys(patch).length === 0) continue;

        nextNodes[targetId] = {
            ...node,
            ...patch,
        };
    }

    return {
        ...baseState,
        nodes: nextNodes,
        rootIds: baseState.rootIds,
    };
}

function normalizeTracks(tracks) {
    if (Array.isArray(tracks)) return tracks;
    return Object.values(tracks || {});
}

function sampleTrackPatch(track, time) {
    if (!track) return null;

    if (track.properties && typeof track.properties === 'object') {
        const patch = {};
        Object.entries(track.properties).forEach(([prop, keyframes]) => {
            const value = sampleProperty(keyframes, time);
            if (value !== null) {
                patch[prop] = value;
            }
        });
        return patch;
    }

    if (track.property && Array.isArray(track.keyframes)) {
        const value = sampleProperty(normalizeArrayKeyframes(track.keyframes, track.easing), time);
        if (value === null) return null;
        return { [track.property]: value };
    }

    return null;
}

function normalizeArrayKeyframes(keyframes, defaultEasing = 'linear') {
    return keyframes
        .map((keyframe) => ({
            time:
                keyframe?.time ??
                keyframe?.timeMs ??
                keyframe?.t ??
                0,
            value: keyframe?.value ?? keyframe?.v ?? null,
            easing: keyframe?.easing ?? defaultEasing,
        }))
        .sort((a, b) => a.time - b.time);
}
