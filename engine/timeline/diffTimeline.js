import { normalizeTimeline } from '../../domain/timeline/TimelineContract.js';

function sortById(a, b) {
    return a.id.localeCompare(b.id);
}

function sortByChannel(a, b) {
    return a.channelId.localeCompare(b.channelId);
}

function sortByReorder(a, b) {
    const id = a.id.localeCompare(b.id);
    if (id !== 0) return id;
    const from = a.fromIndex - b.fromIndex;
    if (from !== 0) return from;
    return a.toIndex - b.toIndex;
}

function sortByMeta(a, b) {
    const id = a.id.localeCompare(b.id);
    if (id !== 0) return id;
    return a.key.localeCompare(b.key);
}

function sortByChannelSet(a, b) {
    return a.id.localeCompare(b.id);
}

function sortByGroupTrack(a, b) {
    return a.id.localeCompare(b.id);
}

function uniqueSorted(list) {
    return Array.from(new Set(list)).sort();
}

export function diffTimeline(before, after) {
    const A = normalizeTimeline(before);
    const B = normalizeTimeline(after);

    const trackByIdA = new Map(A.tracks.map((t) => [t.id, t]));
    const trackByIdB = new Map(B.tracks.map((t) => [t.id, t]));

    const indexByTrackIdA = new Map(A.tracks.map((t, i) => [t.id, i]));
    const indexByTrackIdB = new Map(B.tracks.map((t, i) => [t.id, i]));

    const idsA = new Set(trackByIdA.keys());
    const idsB = new Set(trackByIdB.keys());

    const added = [];
    const removed = [];
    const reordered = [];
    const typeChanged = [];
    const metaChanged = [];
    const channelSetChanged = [];
    const groupAdded = [];
    const groupRemoved = [];
    const groupReordered = [];
    const groupMetaChanged = [];
    const groupMembershipChanged = [];

    for (const id of idsB) {
        if (!idsA.has(id)) {
            const t = trackByIdB.get(id);
            added.push({
                id: t.id,
                index: indexByTrackIdB.get(id),
                type: t.type,
                channelCount: t.channelIds.length,
            });
        }
    }

    for (const id of idsA) {
        if (!idsB.has(id)) {
            const t = trackByIdA.get(id);
            removed.push({
                id: t.id,
                index: indexByTrackIdA.get(id),
                type: t.type,
                channelCount: t.channelIds.length,
            });
        }
    }

    for (const id of idsA) {
        if (!idsB.has(id)) continue;
        const indexA = indexByTrackIdA.get(id);
        const indexB = indexByTrackIdB.get(id);
        if (indexA !== indexB) {
            reordered.push({ id, fromIndex: indexA, toIndex: indexB });
        }

        const trackA = trackByIdA.get(id);
        const trackB = trackByIdB.get(id);

        if (trackA.type !== trackB.type) {
            typeChanged.push({ id, before: trackA.type, after: trackB.type });
        }

        const metaKeys = ['name', 'color', 'locked', 'blendMode'];
        for (const key of metaKeys) {
            const beforeVal = trackA.meta?.[key];
            const afterVal = trackB.meta?.[key];
            if (beforeVal !== afterVal) {
                metaChanged.push({ id, key, before: beforeVal, after: afterVal });
            }
        }

        const setA = new Set(trackA.channelIds);
        const setB = new Set(trackB.channelIds);
        const addedChannels = [];
        const removedChannels = [];

        for (const ch of setB) {
            if (!setA.has(ch)) addedChannels.push(ch);
        }
        for (const ch of setA) {
            if (!setB.has(ch)) removedChannels.push(ch);
        }

        if (addedChannels.length || removedChannels.length) {
            channelSetChanged.push({
                id,
                added: addedChannels.sort(),
                removed: removedChannels.sort(),
            });
        }
    }

    const mapA = new Map();
    const mapB = new Map();

    for (const track of A.tracks) {
        for (const channelId of track.channelIds) {
            mapA.set(channelId, track.id);
        }
    }

    for (const track of B.tracks) {
        for (const channelId of track.channelIds) {
            mapB.set(channelId, track.id);
        }
    }

    const groupByIdA = new Map(A.groups.map((g) => [g.id, g]));
    const groupByIdB = new Map(B.groups.map((g) => [g.id, g]));
    const groupIndexA = new Map(A.groups.map((g, i) => [g.id, i]));
    const groupIndexB = new Map(B.groups.map((g, i) => [g.id, i]));

    const groupIdsA = new Set(groupByIdA.keys());
    const groupIdsB = new Set(groupByIdB.keys());

    for (const id of groupIdsB) {
        if (!groupIdsA.has(id)) {
            const g = groupByIdB.get(id);
            groupAdded.push({
                id: g.id,
                index: groupIndexB.get(id),
                trackCount: g.trackIds.length,
            });
        }
    }

    for (const id of groupIdsA) {
        if (!groupIdsB.has(id)) {
            const g = groupByIdA.get(id);
            groupRemoved.push({
                id: g.id,
                index: groupIndexA.get(id),
                trackCount: g.trackIds.length,
            });
        }
    }

    for (const id of groupIdsA) {
        if (!groupIdsB.has(id)) continue;
        const indexA = groupIndexA.get(id);
        const indexB = groupIndexB.get(id);
        if (indexA !== indexB) {
            groupReordered.push({ id, fromIndex: indexA, toIndex: indexB });
        }

        const groupA = groupByIdA.get(id);
        const groupB = groupByIdB.get(id);

        const groupMetaKeys = ['name', 'collapsed', 'locked'];
        for (const key of groupMetaKeys) {
            const beforeVal = groupA.meta?.[key];
            const afterVal = groupB.meta?.[key];
            if (beforeVal !== afterVal) {
                groupMetaChanged.push({ id, key, before: beforeVal, after: afterVal });
            }
        }

        const setA = new Set(groupA.trackIds);
        const setB = new Set(groupB.trackIds);
        const addedTracks = [];
        const removedTracks = [];

        for (const trackId of setB) {
            if (!setA.has(trackId)) addedTracks.push(trackId);
        }
        for (const trackId of setA) {
            if (!setB.has(trackId)) removedTracks.push(trackId);
        }

        if (addedTracks.length || removedTracks.length) {
            groupMembershipChanged.push({
                id,
                added: addedTracks.sort(),
                removed: removedTracks.sort(),
            });
        }
    }

    const allChannels = uniqueSorted([
        ...Array.from(mapA.keys()),
        ...Array.from(mapB.keys()),
    ]);

    const moved = [];
    const addedAssignments = [];
    const removedAssignments = [];

    for (const channelId of allChannels) {
        const fromTrackId = mapA.get(channelId);
        const toTrackId = mapB.get(channelId);

        if (fromTrackId && toTrackId) {
            if (fromTrackId !== toTrackId) {
                moved.push({ channelId, fromTrackId, toTrackId });
            }
        } else if (!fromTrackId && toTrackId) {
            addedAssignments.push({ channelId, toTrackId });
        } else if (fromTrackId && !toTrackId) {
            removedAssignments.push({ channelId, fromTrackId });
        }
    }

    added.sort(sortById);
    removed.sort(sortById);
    reordered.sort(sortByReorder);
    typeChanged.sort(sortById);
    metaChanged.sort(sortByMeta);
    channelSetChanged.sort(sortByChannelSet);
    moved.sort(sortByChannel);
    addedAssignments.sort(sortByChannel);
    removedAssignments.sort(sortByChannel);

    groupAdded.sort(sortById);
    groupRemoved.sort(sortById);
    groupReordered.sort(sortByReorder);
    groupMetaChanged.sort(sortByMeta);
    groupMembershipChanged.sort(sortByGroupTrack);

    const durationChanged = A.duration !== B.duration;

    const summary = {
        tracks: {
            added: added.length,
            removed: removed.length,
            reordered: reordered.length,
            meta: metaChanged.length,
            type: typeChanged.length,
        },
        groups: {
            added: groupAdded.length,
            removed: groupRemoved.length,
            reordered: groupReordered.length,
            meta: groupMetaChanged.length,
            membership: groupMembershipChanged.length,
        },
        assignments: {
            moved: moved.length,
            added: addedAssignments.length,
            removed: removedAssignments.length,
        },
        duration: durationChanged,
    };

    const changed =
        durationChanged ||
        added.length > 0 ||
        removed.length > 0 ||
        reordered.length > 0 ||
        typeChanged.length > 0 ||
        metaChanged.length > 0 ||
        channelSetChanged.length > 0 ||
        moved.length > 0 ||
        addedAssignments.length > 0 ||
        removedAssignments.length > 0 ||
        groupAdded.length > 0 ||
        groupRemoved.length > 0 ||
        groupReordered.length > 0 ||
        groupMetaChanged.length > 0 ||
        groupMembershipChanged.length > 0;

    return {
        changed,
        summary,
        duration: durationChanged ? { before: A.duration, after: B.duration } : null,
        tracks: {
            added,
            removed,
            reordered,
            typeChanged,
            metaChanged,
            channelSetChanged,
        },
        groups: {
            added: groupAdded,
            removed: groupRemoved,
            reordered: groupReordered,
            metaChanged: groupMetaChanged,
            trackMembershipChanged: groupMembershipChanged,
        },
        channelAssignments: {
            moved,
            added: addedAssignments,
            removed: removedAssignments,
        },
    };
}
