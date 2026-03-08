function normalizeMovingIds({ nodeIds, nodeId }) {
    if (Array.isArray(nodeIds) && nodeIds.length) return nodeIds;
    if (nodeId) return [nodeId];
    return [];
}

export function reorderNode({ nodes = {}, containerId, nodeIds, nodeId, index }) {
    const movingIds = normalizeMovingIds({ nodeIds, nodeId }).filter(Boolean);
    const container = nodes[containerId];
    if (!container || !movingIds.length) {
        return nodes;
    }

    const existing = Array.isArray(container.children) ? container.children : [];
    const moving = existing.filter((id) => movingIds.includes(id));
    const remaining = existing.filter((id) => !movingIds.includes(id));
    const clampedIndex = Math.max(0, Math.min(index ?? 0, remaining.length));
    const nextChildren = [
        ...remaining.slice(0, clampedIndex),
        ...moving,
        ...remaining.slice(clampedIndex),
    ];

    return {
        ...nodes,
        [containerId]: {
            ...container,
            children: nextChildren,
        },
    };
}
