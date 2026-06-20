export function resolveSelectableGroupTarget(nodesById, nodeId) {
    if (!nodeId || !nodesById?.[nodeId]) {
        return nodeId ?? null;
    }

    let current = nodesById[nodeId];

    while (current?.parentId) {
        const parent = nodesById[current.parentId];
        if (!parent) break;
        if (parent.type === 'group') {
            return parent.id;
        }
        current = parent;
    }

    return nodeId;
}
