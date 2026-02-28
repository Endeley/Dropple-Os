export function buildSceneTree(structuralGraph) {
    if (!structuralGraph || typeof structuralGraph !== 'object') {
        return null;
    }

    const nodes = Array.isArray(structuralGraph.nodes) ? structuralGraph.nodes : [];
    const nodesById = new Map(nodes.map((node) => [node.id, node]));
    const tree = structuralGraph.tree && typeof structuralGraph.tree === 'object'
        ? structuralGraph.tree
        : {};
    const rootId = structuralGraph.rootId;
    const visiting = new Set();

    function buildNode(id) {
        if (visiting.has(id)) {
            throw new Error(`Scene graph cycle detected at ${id}`);
        }
        const base = nodesById.get(id);
        if (!base) return null;
        visiting.add(id);
        const childIds = Array.isArray(tree[id]) ? tree[id] : [];
        const children = childIds.map(buildNode).filter(Boolean);
        visiting.delete(id);
        return {
            id: base.id,
            type: base.type,
            transform: base.transform,
            opacity: base.opacity,
            channels: base.channels,
            children,
        };
    }

    return buildNode(rootId);
}
