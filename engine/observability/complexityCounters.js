export function countTracks(timeline) {
    const tracks = timeline?.tracks;
    if (Array.isArray(tracks)) return tracks.length;
    if (tracks && typeof tracks === 'object') return Object.keys(tracks).length;
    return 0;
}

export function countGroups(timeline) {
    const groups = timeline?.groups;
    if (Array.isArray(groups)) return groups.length;
    if (groups && typeof groups === 'object') return Object.keys(groups).length;
    return 0;
}

export function countChannels(timeline) {
    const tracks = Array.isArray(timeline?.tracks) ? timeline.tracks : [];
    const channelIds = new Set();

    for (const track of tracks) {
        if (!track || track.type === 'mute') continue;
        const ids = Array.isArray(track.channelIds) ? track.channelIds : [];
        for (const id of ids) {
            if (id != null) channelIds.add(id);
        }
    }

    return channelIds.size;
}

export function countDagNodes(snapshotGraph) {
    const nodes = snapshotGraph?.nodes;
    if (!nodes || typeof nodes !== 'object') return 0;
    return Object.keys(nodes).length;
}

export function countDagBranches(snapshotGraph) {
    const nodes = snapshotGraph?.nodes;
    if (!nodes || typeof nodes !== 'object') return 0;

    return Object.values(nodes).reduce((count, node) => {
        const children = Array.isArray(node?.childrenIds) ? node.childrenIds : [];
        return children.length > 1 ? count + 1 : count;
    }, 0);
}
