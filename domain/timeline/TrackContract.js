export const TRACK_TYPES = Object.freeze({
    STANDARD: 'standard',
    OVERLAY: 'overlay',
    MUTE: 'mute',
});

export function createTrack({
    id,
    type = TRACK_TYPES.STANDARD,
    order = 0,
    channelIds = [],
    meta = {},
}) {
    return normalizeTrack({
        id,
        type,
        order,
        channelIds,
        meta,
    });
}

export function normalizeTrack(track) {
    if (!track || typeof track !== 'object') {
        throw new Error('Invalid track object');
    }

    const { id, type, order, channelIds, meta } = track;

    if (!id || typeof id !== 'string') {
        throw new Error('Track.id must be non-empty string');
    }

    if (!Object.values(TRACK_TYPES).includes(type)) {
        throw new Error(`Invalid track type: ${type}`);
    }

    if (!Number.isFinite(order)) {
        throw new Error('Track.order must be finite number');
    }

    if (!Array.isArray(channelIds)) {
        throw new Error('Track.channelIds must be array');
    }

    const uniqueChannels = Array.from(new Set(channelIds));
    uniqueChannels.sort();

    const normalizedMeta = {
        name: meta?.name ?? undefined,
        color: meta?.color ?? undefined,
        locked: meta?.locked ?? false,
    };

    return {
        id,
        type,
        order: Math.floor(order),
        channelIds: uniqueChannels,
        meta: normalizedMeta,
    };
}

export function validateTrack(track) {
    normalizeTrack(track);
    return true;
}

import crypto from 'crypto';

export function hashTrack(track) {
    const normalized = normalizeTrack(track);
    const json = JSON.stringify(normalized);
    return crypto.createHash('sha256').update(json).digest('hex');
}
