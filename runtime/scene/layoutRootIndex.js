export function buildLayoutRootIndex(document) {
    const index = new Map();
    const nodes = document?.sceneGraph?.nodes || {};
    const layoutNodes = document?.layout?.nodes || {};
    const sortedIds = Object.keys(nodes).sort();

    for (const nodeId of sortedIds) {
        const root = findLayoutRoot(nodeId, nodes, layoutNodes);
        index.set(nodeId, root);
    }

    return index;
}

function findLayoutRoot(nodeId, nodes, layoutNodes) {
    let current = nodes[nodeId];

    while (current) {
        if (isLayoutRoot(current, layoutNodes[current.id])) {
            return current.id;
        }

        current = nodes[current.parent] || nodes[current.parentId];
    }

    return nodeId;
}

function isLayoutRoot(node, layoutNode) {
    if (!node) return false;
    if (node.type === 'frame') return true;

    if (
        layoutNode &&
        (
            layoutNode.mode === 'flow' ||
            layoutNode.mode === 'grid' ||
            layoutNode.mode === 'constraint' ||
            layoutNode.container != null ||
            layoutNode.autoLayout != null
        )
    ) {
        return true;
    }

    return false;
}
