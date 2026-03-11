export function orderDirtyNodes(order, dirtyNodes) {
    const ordered = [];

    for (const nodeId of order) {
        if (dirtyNodes.has(nodeId)) {
            ordered.push(nodeId);
        }
    }

    return ordered;
}
