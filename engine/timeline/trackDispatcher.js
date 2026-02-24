import { normalizeTimeline, validateTimeline } from '../../domain/timeline/TimelineContract.js';
import { createTrack } from '../../domain/timeline/TrackContract.js';

export const TrackActions = Object.freeze({
    ADD_TRACK: 'ADD_TRACK',
    REMOVE_TRACK: 'REMOVE_TRACK',
    REORDER_TRACK: 'REORDER_TRACK',
    ASSIGN_CHANNEL: 'ASSIGN_CHANNEL',
    UNASSIGN_CHANNEL: 'UNASSIGN_CHANNEL',
});

export function dispatchTrackAction(timeline, action) {
    switch (action?.type) {
        case TrackActions.ADD_TRACK:
            return addTrack(timeline, action.payload);
        case TrackActions.REMOVE_TRACK:
            return removeTrack(timeline, action.payload);
        case TrackActions.REORDER_TRACK:
            return reorderTrack(timeline, action.payload);
        case TrackActions.ASSIGN_CHANNEL:
            return assignChannel(timeline, action.payload);
        case TrackActions.UNASSIGN_CHANNEL:
            return unassignChannel(timeline, action.payload);
        default:
            throw new Error(`Unknown track action: ${action?.type}`);
    }
}

function addTrack(timeline, { id, type }) {
    const normalized = normalizeTimeline(timeline);

    if (normalized.tracks.some((t) => t.id === id)) {
        throw new Error(`Track ${id} already exists`);
    }

    const newTrack = createTrack({
        id,
        type,
        order: normalized.tracks.length,
        channelIds: [],
    });

    const next = {
        ...normalized,
        tracks: [...normalized.tracks, newTrack],
    };

    validateTimeline(next);

    return normalizeTimeline(next);
}

function removeTrack(timeline, { id }) {
    const normalized = normalizeTimeline(timeline);

    const filtered = normalized.tracks.filter((t) => t.id !== id);

    const next = {
        ...normalized,
        tracks: filtered,
    };

    validateTimeline(next);

    return normalizeTimeline(next);
}

function reorderTrack(timeline, { id, toIndex }) {
    const normalized = normalizeTimeline(timeline);

    const tracks = [...normalized.tracks];
    const index = tracks.findIndex((t) => t.id === id);

    if (index === -1) {
        throw new Error(`Track ${id} not found`);
    }

    const [moved] = tracks.splice(index, 1);
    tracks.splice(toIndex, 0, moved);

    const next = {
        ...normalized,
        tracks,
    };

    validateTimeline(next);

    return normalizeTimeline(next);
}

function assignChannel(timeline, { trackId, channelId }) {
    const normalized = normalizeTimeline(timeline);

    const tracks = normalized.tracks.map((track) => ({
        ...track,
        channelIds: track.channelIds.filter((id) => id !== channelId),
    }));

    const targetIndex = tracks.findIndex((t) => t.id === trackId);

    if (targetIndex === -1) {
        throw new Error(`Track ${trackId} not found`);
    }

    tracks[targetIndex] = {
        ...tracks[targetIndex],
        channelIds: [...tracks[targetIndex].channelIds, channelId],
    };

    const next = {
        ...normalized,
        tracks,
    };

    validateTimeline(next);

    return normalizeTimeline(next);
}

function unassignChannel(timeline, { trackId, channelId }) {
    const normalized = normalizeTimeline(timeline);

    const tracks = normalized.tracks.map((track) =>
        track.id === trackId
            ? {
                  ...track,
                  channelIds: track.channelIds.filter((id) => id !== channelId),
              }
            : track
    );

    const next = {
        ...normalized,
        tracks,
    };

    validateTimeline(next);

    return normalizeTimeline(next);
}
