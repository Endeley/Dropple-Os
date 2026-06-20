function resolveOrderedNodeIds(nodes, parentChildren, nodeIds) {
    const selected = new Set(nodeIds);
    const orderedFromParent = parentChildren.filter((id) => selected.has(id) && nodes[id]);
    if (orderedFromParent.length === selected.size) {
        return orderedFromParent;
    }

    // Fallback for routes that have valid selected nodes but stale or incomplete
    // parent/root child ordering. Grouping must still produce a real wrapper node.
    return nodeIds.filter((id) => selected.has(id) && nodes[id]);
}

export function wrapNodes({ nodes = {}, rootIds = [], nodeIds = [], wrapperNode, parentId = undefined, index }) {
    const orderedRootIds = Array.isArray(rootIds) ? [...rootIds] : [];
    const ids = Array.isArray(nodeIds) ? nodeIds.filter(Boolean) : [];
    if (!ids.length || !wrapperNode?.id || nodes[wrapperNode.id]) {
        return { nodes, rootIds };
    }

    const resolvedParentId =
        parentId !== undefined ? parentId : (nodes[ids[0]]?.parentId ?? null);
    const parentChildren =
        resolvedParentId != null
            ? [...(nodes[resolvedParentId]?.children || [])]
            : orderedRootIds;
    const orderedNodeIds = resolveOrderedNodeIds(nodes, parentChildren, ids);
    if (!orderedNodeIds.length) {
        return { nodes, rootIds };
    }

    const nextNodes = { ...nodes };
    const firstIndex = parentChildren.findIndex((id) => id === orderedNodeIds[0]);
    const wrapperIndex =
        firstIndex >= 0
            ? firstIndex
            : typeof index === 'number'
              ? Math.max(0, Math.min(index, parentChildren.length))
              : parentChildren.length;
    const remainingSiblings = parentChildren.filter((id) => !orderedNodeIds.includes(id));
    const nextSiblings = [
        ...remainingSiblings.slice(0, wrapperIndex),
        wrapperNode.id,
        ...remainingSiblings.slice(wrapperIndex),
    ];

    nextNodes[wrapperNode.id] = {
        children: orderedNodeIds,
        ...wrapperNode,
        parentId: resolvedParentId ?? null,
    };

    orderedNodeIds.forEach((id) => {
        const node = nextNodes[id];
        if (!node) return;
        nextNodes[id] = {
            ...node,
            parentId: wrapperNode.id,
        };
    });

    if (resolvedParentId != null) {
        const parent = nextNodes[resolvedParentId];
        if (!parent) {
            return { nodes, rootIds };
        }

        nextNodes[resolvedParentId] = {
            ...parent,
            children: nextSiblings,
        };

        return {
            nodes: nextNodes,
            rootIds: orderedRootIds.filter((id) => !orderedNodeIds.includes(id)),
        };
    }

    return {
        nodes: nextNodes,
        rootIds: nextSiblings,
    };
}
