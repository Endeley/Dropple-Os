function normalizeDetachIds({ ids, nodeId, nodeIds }) {
    if (Array.isArray(ids) && ids.length) return ids;
    if (Array.isArray(nodeIds) && nodeIds.length) return nodeIds;
    if (nodeId) return [nodeId];
    return [];
}

export function detachNode({ nodes = {}, rootIds = [], ids, nodeId, nodeIds }) {
    const detachIds = normalizeDetachIds({ ids, nodeId, nodeIds }).filter(Boolean);
    if (!detachIds.length) {
        return { nodes, rootIds };
    }

    const nextNodes = { ...nodes };
    const nextRootIds = new Set(rootIds || []);

    detachIds.forEach((id) => {
        const child = nodes[id];
        if (!child) return;

        const prevParentId = child.parentId;
        if (prevParentId) {
            const prevParent = nextNodes[prevParentId];
            if (prevParent) {
                const prevChildren = Array.isArray(prevParent.children) ? prevParent.children : [];
                nextNodes[prevParentId] = {
                    ...prevParent,
                    children: prevChildren.filter((childId) => childId !== id),
                };
            }
        }

        nextNodes[id] = {
            ...child,
            parentId: null,
        };
        nextRootIds.add(id);
    });

    return {
        nodes: nextNodes,
        rootIds: Array.from(nextRootIds),
    };
}
