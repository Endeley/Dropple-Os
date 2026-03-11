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

    rootIds.forEach((rootId, index) => {
        partitions.set(`p${index}`, {
            id: `p${index}`,
            root: rootId,
            nodes: collectSubtree(nodes, rootId),
            bounds: null,
            dirty: false,
        });
    });

    return partitions;
}
