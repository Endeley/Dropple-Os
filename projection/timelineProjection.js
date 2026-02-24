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

    return {
        duration: normalized.duration,
        trackCount: tracks.length,
        tracks,
        channelToTrackMap,
    };
}
