export function buildSegmentGraph(graph, nodeToSegment) {
    const segmentGraph = new Map();

    for (const [nodeId, children] of graph.entries()) {
        const fromSegmentId = nodeToSegment.get(nodeId);
        if (!fromSegmentId) continue;

        if (!segmentGraph.has(fromSegmentId)) {
            segmentGraph.set(fromSegmentId, new Set());
        }

        for (const childId of children) {
            const toSegmentId = nodeToSegment.get(childId);
            if (!toSegmentId || toSegmentId === fromSegmentId) continue;

            segmentGraph.get(fromSegmentId).add(toSegmentId);
        }
    }

    return segmentGraph;
}
