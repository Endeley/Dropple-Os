import { normalizeTimeline, validateTimeline } from '../../domain/timeline/TimelineContract.js';
import { createTrack } from '../../domain/timeline/TrackContract.js';

export const TrackActions = Object.freeze({
    ADD_TRACK: 'ADD_TRACK',
    REMOVE_TRACK: 'REMOVE_TRACK',
    REORDER_TRACK: 'REORDER_TRACK',
    ASSIGN_CHANNEL: 'ASSIGN_CHANNEL',
    UNASSIGN_CHANNEL: 'UNASSIGN_CHANNEL',
    TOGGLE_TRACK_LOCK: 'TOGGLE_TRACK_LOCK',
    SET_TRACK_BLEND_MODE: 'SET_TRACK_BLEND_MODE',
    ADD_GROUP: 'ADD_GROUP',
    REMOVE_GROUP: 'REMOVE_GROUP',
    REORDER_GROUP: 'REORDER_GROUP',
    ASSIGN_TRACK_TO_GROUP: 'ASSIGN_TRACK_TO_GROUP',
    UNASSIGN_TRACK_FROM_GROUP: 'UNASSIGN_TRACK_FROM_GROUP',
    TOGGLE_GROUP_LOCK: 'TOGGLE_GROUP_LOCK',
    TOGGLE_GROUP_COLLAPSE: 'TOGGLE_GROUP_COLLAPSE',
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
        case TrackActions.TOGGLE_TRACK_LOCK:
            return toggleTrackLock(timeline, action.payload);
        case TrackActions.SET_TRACK_BLEND_MODE:
            // Blend modes must remain deterministic and pure.
            // Do not introduce random, floating-unstable,
            // or time-dependent blending logic here.
            return setTrackBlendMode(timeline, action.payload);
        case TrackActions.ADD_GROUP:
            return addGroup(timeline, action.payload);
        case TrackActions.REMOVE_GROUP:
            return removeGroup(timeline, action.payload);
        case TrackActions.REORDER_GROUP:
            return reorderGroup(timeline, action.payload);
        case TrackActions.ASSIGN_TRACK_TO_GROUP:
            return assignTrackToGroup(timeline, action.payload);
        case TrackActions.UNASSIGN_TRACK_FROM_GROUP:
            return unassignTrackFromGroup(timeline, action.payload);
        case TrackActions.TOGGLE_GROUP_LOCK:
            return toggleGroupLock(timeline, action.payload);
        case TrackActions.TOGGLE_GROUP_COLLAPSE:
            return toggleGroupCollapse(timeline, action.payload);
        default:
            throw new Error(`Unknown track action: ${action?.type}`);
    }
}

function findGroupByTrackId(groups, trackId) {
    return groups.find((group) => group.trackIds.includes(trackId)) ?? null;
}

function assertGroupUnlocked(groups, trackId) {
    const group = findGroupByTrackId(groups, trackId);
    if (group?.meta?.locked) {
        throw new Error(`Group ${group.id} is locked`);
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
    const targetTrack = normalized.tracks.find((track) => track.id === id);
    if (targetTrack?.meta?.locked) {
        throw new Error(`Track ${id} is locked`);
    }
    assertGroupUnlocked(normalized.groups, id);

    const filtered = normalized.tracks.filter((t) => t.id !== id);
    const groups = normalized.groups.map((group) => ({
        ...group,
        trackIds: group.trackIds.filter((trackId) => trackId !== id),
    }));

    const next = {
        ...normalized,
        tracks: filtered,
        groups,
    };

    validateTimeline(next);

    return normalizeTimeline(next);
}

function reorderTrack(timeline, { id, toIndex }) {
    const normalized = normalizeTimeline(timeline);
    if (normalized.tracks.some((track) => track.meta?.locked)) {
        throw new Error('Cannot reorder when locked tracks present');
    }
    if (normalized.groups.some((group) => group.meta?.locked)) {
        throw new Error('Cannot reorder when locked groups present');
    }
    assertGroupUnlocked(normalized.groups, id);

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

    const targetTrack = normalized.tracks.find((track) => track.id === trackId);
    if (!targetTrack) {
        throw new Error(`Track ${trackId} not found`);
    }
    if (targetTrack.meta?.locked) {
        throw new Error(`Track ${trackId} is locked`);
    }
    const sourceTrack = normalized.tracks.find((track) => track.channelIds.includes(channelId));
    if (sourceTrack?.meta?.locked) {
        throw new Error(`Track ${sourceTrack.id} is locked`);
    }
    assertGroupUnlocked(normalized.groups, trackId);
    if (sourceTrack) {
        assertGroupUnlocked(normalized.groups, sourceTrack.id);
    }

    const tracks = normalized.tracks.map((track) => ({
        ...track,
        channelIds: track.channelIds.filter((id) => id !== channelId),
    }));

    const targetIndex = tracks.findIndex((t) => t.id === trackId);

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
    const targetTrack = normalized.tracks.find((track) => track.id === trackId);
    if (targetTrack?.meta?.locked) {
        throw new Error(`Track ${trackId} is locked`);
    }
    assertGroupUnlocked(normalized.groups, trackId);

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

function toggleTrackLock(timeline, { id }) {
    const normalized = normalizeTimeline(timeline);
    const targetTrack = normalized.tracks.find((track) => track.id === id);
    if (!targetTrack) {
        throw new Error(`Track ${id} not found`);
    }
    assertGroupUnlocked(normalized.groups, id);

    const tracks = normalized.tracks.map((track) =>
        track.id === id
            ? {
                  ...track,
                  meta: {
                      ...track.meta,
                      locked: !track.meta?.locked,
                  },
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

function setTrackBlendMode(timeline, { id, blendMode }) {
    const normalized = normalizeTimeline(timeline);
    const targetTrack = normalized.tracks.find((track) => track.id === id);
    if (!targetTrack) {
        throw new Error(`Track ${id} not found`);
    }
    if (targetTrack.meta?.locked) {
        throw new Error(`Track ${id} is locked`);
    }
    assertGroupUnlocked(normalized.groups, id);
    if (targetTrack.type === 'overlay') {
        throw new Error('Overlay track blend mode is fixed');
    }

    const tracks = normalized.tracks.map((track) =>
        track.id === id
            ? {
                  ...track,
                  meta: {
                      ...track.meta,
                      blendMode,
                  },
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

function addGroup(timeline, { id }) {
    const normalized = normalizeTimeline(timeline);
    if (normalized.groups.some((group) => group.id === id)) {
        throw new Error(`Group ${id} already exists`);
    }

    const newGroup = {
        id,
        order: normalized.groups.length,
        trackIds: [],
        meta: {},
    };

    const next = {
        ...normalized,
        groups: [...normalized.groups, newGroup],
    };

    validateTimeline(next);
    return normalizeTimeline(next);
}

function removeGroup(timeline, { id }) {
    const normalized = normalizeTimeline(timeline);
    const targetGroup = normalized.groups.find((group) => group.id === id);
    if (targetGroup?.meta?.locked) {
        throw new Error(`Group ${id} is locked`);
    }

    const groups = normalized.groups.filter((group) => group.id !== id);
    const next = {
        ...normalized,
        groups,
    };

    validateTimeline(next);
    return normalizeTimeline(next);
}

function reorderGroup(timeline, { id, toIndex }) {
    const normalized = normalizeTimeline(timeline);
    const groups = [...normalized.groups];
    const index = groups.findIndex((group) => group.id === id);
    if (index === -1) {
        throw new Error(`Group ${id} not found`);
    }
    if (groups[index]?.meta?.locked) {
        throw new Error(`Group ${id} is locked`);
    }

    const [moved] = groups.splice(index, 1);
    groups.splice(toIndex, 0, moved);

    const next = {
        ...normalized,
        groups,
    };

    validateTimeline(next);
    return normalizeTimeline(next);
}

function assignTrackToGroup(timeline, { groupId, trackId }) {
    const normalized = normalizeTimeline(timeline);
    const targetGroup = normalized.groups.find((group) => group.id === groupId);
    if (!targetGroup) {
        throw new Error(`Group ${groupId} not found`);
    }
    if (targetGroup.meta?.locked) {
        throw new Error(`Group ${groupId} is locked`);
    }

    const track = normalized.tracks.find((t) => t.id === trackId);
    if (!track) {
        throw new Error(`Track ${trackId} not found`);
    }
    if (track.meta?.locked) {
        throw new Error(`Track ${trackId} is locked`);
    }
    const sourceGroup = findGroupByTrackId(normalized.groups, trackId);
    if (sourceGroup?.meta?.locked) {
        throw new Error(`Group ${sourceGroup.id} is locked`);
    }

    const groups = normalized.groups.map((group) => ({
        ...group,
        trackIds: group.trackIds.filter((id) => id !== trackId),
    }));

    const index = groups.findIndex((group) => group.id === groupId);
    groups[index] = {
        ...groups[index],
        trackIds: [...groups[index].trackIds, trackId],
    };

    const next = {
        ...normalized,
        groups,
    };

    validateTimeline(next);
    return normalizeTimeline(next);
}

function unassignTrackFromGroup(timeline, { groupId, trackId }) {
    const normalized = normalizeTimeline(timeline);
    const targetGroup = normalized.groups.find((group) => group.id === groupId);
    if (!targetGroup) {
        throw new Error(`Group ${groupId} not found`);
    }
    if (targetGroup.meta?.locked) {
        throw new Error(`Group ${groupId} is locked`);
    }

    const track = normalized.tracks.find((t) => t.id === trackId);
    if (!track) {
        throw new Error(`Track ${trackId} not found`);
    }
    if (track.meta?.locked) {
        throw new Error(`Track ${trackId} is locked`);
    }
    const sourceGroup = findGroupByTrackId(normalized.groups, trackId);
    if (sourceGroup?.meta?.locked) {
        throw new Error(`Group ${sourceGroup.id} is locked`);
    }

    const groups = normalized.groups.map((group) =>
        group.id === groupId
            ? {
                  ...group,
                  trackIds: group.trackIds.filter((id) => id !== trackId),
              }
            : group
    );

    const next = {
        ...normalized,
        groups,
    };

    validateTimeline(next);
    return normalizeTimeline(next);
}

function toggleGroupLock(timeline, { id }) {
    const normalized = normalizeTimeline(timeline);
    const targetGroup = normalized.groups.find((group) => group.id === id);
    if (!targetGroup) {
        throw new Error(`Group ${id} not found`);
    }

    const groups = normalized.groups.map((group) =>
        group.id === id
            ? {
                  ...group,
                  meta: {
                      ...group.meta,
                      locked: !group.meta?.locked,
                  },
              }
            : group
    );

    const next = {
        ...normalized,
        groups,
    };

    validateTimeline(next);
    return normalizeTimeline(next);
}

function toggleGroupCollapse(timeline, { id }) {
    const normalized = normalizeTimeline(timeline);
    const targetGroup = normalized.groups.find((group) => group.id === id);
    if (!targetGroup) {
        throw new Error(`Group ${id} not found`);
    }

    const groups = normalized.groups.map((group) =>
        group.id === id
            ? {
                  ...group,
                  meta: {
                      ...group.meta,
                      collapsed: !group.meta?.collapsed,
                  },
              }
            : group
    );

    const next = {
        ...normalized,
        groups,
    };

    validateTimeline(next);
    return normalizeTimeline(next);
}
