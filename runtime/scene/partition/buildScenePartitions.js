function collectSubtree(nodes, nodeId, out = new Set()) {
    if (!nodeId || out.has(nodeId)) return out;

    out.add(nodeId);

    const node = nodes?.[nodeId];
    const children = Array.isArray(node?.children) ? [...node.children].sort() : [];

    for (const childId of children) {
        collectSubtree(nodes, childId, out);
    }

    return out;
}

export function buildScenePartitions(document) {
    const sceneGraph = document?.sceneGraph ?? {};
    const nodes = sceneGraph.nodes ?? {};
    const rootIds = Array.isArray(sceneGraph.rootIds) && sceneGraph.rootIds.length
        ? [...sceneGraph.rootIds].sort()
        : Object.keys(nodes)
              .filter((nodeId) => !nodes[nodeId]?.parentId)
              .sort();
    const partitions = new Map();
    const nodeToPartition = new Map();

    rootIds.forEach((rootId, index) => {
        const partitionId = `p${index}`;
        const partitionNodes = collectSubtree(nodes, rootId);

        partitions.set(partitionId, {
            id: `p${index}`,
            root: rootId,
            nodes: partitionNodes,
            bounds: null,
            visible: true,
            dirty: false,
        });

        for (const nodeId of partitionNodes) {
            nodeToPartition.set(nodeId, partitionId);
        }
    });

    return {
        partitions,
        nodeToPartition,
    };
}
