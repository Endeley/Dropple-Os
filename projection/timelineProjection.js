import { normalizeTimeline } from '../domain/timeline/TimelineContract.js';

export function projectTimeline(timeline) {
    const normalized = normalizeTimeline(timeline);

    const channelToTrackMap = new Map();

    const tracks = normalized.tracks.map((track, index) => {
        track.channelIds.forEach((channelId) => {
            channelToTrackMap.set(channelId, track.id);
        });

        return {
            id: track.id,
            index,
            type: track.type,
            channelCount: track.channelIds.length,
            channels: [...track.channelIds],
            meta: { ...track.meta },
        };
    });

    const groupMap = new Map();
    const groups = normalized.groups.map((group, index) => {
        group.trackIds.forEach((trackId) => {
            groupMap.set(trackId, group.id);
        });

        return {
            id: group.id,
            index,
            trackCount: group.trackIds.length,
            trackIds: [...group.trackIds],
            meta: { ...group.meta },
        };
    });

    return {
        duration: normalized.duration,
        trackCount: tracks.length,
        groupCount: groups.length,
        tracks,
        groups,
        channelToTrackMap,
        groupMap,
    };
}
