export function frontierSegmentSchedule({
    dirtyNodes,
    nodeToSegment,
    segmentGraph,
    allowedSegments = null,
}) {
    const dirtySegments = new Set();

    for (const nodeId of dirtyNodes) {
        const segmentId = nodeToSegment.get(nodeId);
        if (!segmentId) continue;
        if (allowedSegments && !allowedSegments.has(segmentId)) continue;
        dirtySegments.add(segmentId);
    }

    const queue = [...dirtySegments].sort();
    const visited = new Set();
    const affected = new Set();

    while (queue.length) {
        const segmentId = queue.shift();

        if (visited.has(segmentId)) continue;
        visited.add(segmentId);

        if (allowedSegments && !allowedSegments.has(segmentId)) {
            continue;
        }

        affected.add(segmentId);

        const children = [...(segmentGraph.get(segmentId) || [])].sort();
        for (const childSegmentId of children) {
            if (!visited.has(childSegmentId)) {
                queue.push(childSegmentId);
            }
        }
    }

    return affected;
}
