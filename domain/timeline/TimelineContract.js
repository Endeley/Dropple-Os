import crypto from 'crypto';
import { normalizeTrack } from './TrackContract.js';
import { normalizeGroup } from './TrackGroupContract.js';

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

    const trackIdSet = new Set(normalizedTracks.map((track) => track.id));
    const normalizedGroups = (timeline.groups ?? [])
        .map((group) => normalizeGroup(group, trackIdSet))
        .sort((a, b) => a.order - b.order);

    normalizedGroups.forEach((group, index) => {
        group.order = index;
    });

    const seenGroupTracks = new Set();
    for (const group of normalizedGroups) {
        for (const trackId of group.trackIds) {
            if (seenGroupTracks.has(trackId)) {
                throw new Error(`Track ${trackId} duplicated across groups`);
            }
            seenGroupTracks.add(trackId);
        }
    }

    return {
        duration,
        tracks: normalizedTracks,
        groups: normalizedGroups,
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
