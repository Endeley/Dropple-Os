function normalizeChildIds({ childId, childIds, nodeId, nodeIds }) {
    if (Array.isArray(childIds) && childIds.length) return childIds;
    if (Array.isArray(nodeIds) && nodeIds.length) return nodeIds;
    if (childId) return [childId];
    if (nodeId) return [nodeId];
    return [];
}

export function attachNode({ nodes = {}, rootIds = [], parentId, childId, childIds, nodeId, nodeIds, index }) {
    const ids = normalizeChildIds({ childId, childIds, nodeId, nodeIds }).filter(Boolean);
    const parent = nodes[parentId];
    if (!parent || !ids.length) {
        return { nodes, rootIds };
    }

    const nextNodes = { ...nodes };
    const existing = Array.isArray(parent.children) ? parent.children : [];
    const filtered = existing.filter((id) => !ids.includes(id));
    const clampedIndex =
        typeof index === 'number'
            ? Math.max(0, Math.min(index, filtered.length))
            : filtered.length;
    const nextChildren = [
        ...filtered.slice(0, clampedIndex),
        ...ids,
        ...filtered.slice(clampedIndex),
    ];

    nextNodes[parentId] = {
        ...parent,
        children: nextChildren,
    };

    ids.forEach((id) => {
        const child = nextNodes[id];
        if (!child) return;

        const prevParentId = child.parentId;
        if (prevParentId && prevParentId !== parentId) {
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
            parentId,
        };
    });

    return {
        nodes: nextNodes,
        rootIds: rootIds.filter((id) => !ids.includes(id)),
    };
}
