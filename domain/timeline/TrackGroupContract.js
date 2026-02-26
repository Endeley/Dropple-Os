export function normalizeGroup(group, validTrackIds) {
    if (!group || typeof group !== 'object') {
        throw new Error('Invalid group object');
    }

    const { id, order, trackIds, meta } = group;

    if (!id || typeof id !== 'string') {
        throw new Error('Group.id must be non-empty string');
    }

    if (!Number.isFinite(order)) {
        throw new Error('Group.order must be finite number');
    }

    if (!Array.isArray(trackIds)) {
        throw new Error('Group.trackIds must be array');
    }

    const uniqueTracks = Array.from(new Set(trackIds));
    uniqueTracks.sort();

    if (validTrackIds) {
        for (const trackId of uniqueTracks) {
            if (!validTrackIds.has(trackId)) {
                throw new Error(`Group.trackIds contains unknown track: ${trackId}`);
            }
        }
    }

    const normalizedMeta = {
        name: meta?.name ?? undefined,
        collapsed: meta?.collapsed ?? false,
        locked: meta?.locked ?? false,
    };

    return {
        id,
        order: Math.floor(order),
        trackIds: uniqueTracks,
        meta: normalizedMeta,
    };
}

export function validateGroup(group, validTrackIds) {
    normalizeGroup(group, validTrackIds);
    return true;
}
