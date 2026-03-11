function buildParentCounts(graph) {
    const parentCounts = new Map();
    const uniqueParent = new Map();

    for (const nodeId of graph.keys()) {
        parentCounts.set(nodeId, 0);
    }

    for (const [parentId, children] of graph.entries()) {
        for (const childId of children) {
            parentCounts.set(childId, (parentCounts.get(childId) || 0) + 1);
            if (!uniqueParent.has(childId)) {
                uniqueParent.set(childId, parentId);
            }
        }
    }

    return {
        parentCounts,
        uniqueParent,
    };
}

function isChainContinuation(nodeId, graph, parentCounts, uniqueParent) {
    if ((parentCounts.get(nodeId) || 0) !== 1) {
        return false;
    }

    const parentId = uniqueParent.get(nodeId);
    if (!parentId) return false;

    const parentChildren = graph.get(parentId) || [];
    return parentChildren.length === 1;
}

export function buildSegments(graph) {
    const segments = new Map();
    const nodeToSegment = new Map();
    const visited = new Set();
    const { parentCounts, uniqueParent } = buildParentCounts(graph);
    const nodeIds = [...graph.keys()].sort();
    let segmentId = 0;

    function buildFrom(startNodeId) {
        const segmentNodes = [];
        let current = startNodeId;

        while (true) {
            if (visited.has(current)) break;

            segmentNodes.push(current);
            visited.add(current);

            const children = [...(graph.get(current) || [])].sort();
            if (children.length !== 1) break;

            const childId = children[0];
            if ((parentCounts.get(childId) || 0) !== 1) break;

            current = childId;
        }

        const id = `s${segmentId++}`;
        segments.set(id, {
            id,
            nodes: segmentNodes,
        });

        for (const segmentNodeId of segmentNodes) {
            nodeToSegment.set(segmentNodeId, id);
        }
    }

    for (const nodeId of nodeIds) {
        if (visited.has(nodeId)) continue;
        if (isChainContinuation(nodeId, graph, parentCounts, uniqueParent)) continue;
        buildFrom(nodeId);
    }

    for (const nodeId of nodeIds) {
        if (visited.has(nodeId)) continue;
        buildFrom(nodeId);
    }

    return {
        segments,
        nodeToSegment,
    };
}
