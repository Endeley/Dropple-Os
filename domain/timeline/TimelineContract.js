import crypto from 'crypto';
import { normalizeTrack } from './TrackContract.js';

export function normalizeTimeline(timeline) {
    if (!timeline || typeof timeline !== 'object') {
        throw new Error('Invalid timeline');
    }

    const duration = Math.max(0, Math.floor(timeline.duration ?? 0));

    const normalizedTracks = (timeline.tracks ?? [])
        .map(normalizeTrack)
        .sort((a, b) => a.order - b.order);

    normalizedTracks.forEach((track, index) => {
        track.order = index;
    });

    return {
        duration,
        tracks: normalizedTracks,
        channels: timeline.channels ?? [],
    };
}

export function validateTimeline(timeline) {
    const normalized = normalizeTimeline(timeline);

    const seenChannels = new Map();

    for (const track of normalized.tracks) {
        if (track.type === 'mute') continue;

        for (const channelId of track.channelIds) {
            if (seenChannels.has(channelId)) {
                throw new Error(`Channel ${channelId} duplicated across tracks`);
            }
            seenChannels.set(channelId, track.id);
        }
    }

    return true;
}

export function hashTimeline(timeline) {
    const normalized = normalizeTimeline(timeline);
    const json = JSON.stringify(normalized);

    return crypto.createHash('sha256').update(json).digest('hex');
}
