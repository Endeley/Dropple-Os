export function buildLayoutRootIndex(document) {
    const index = new Map();
    const nodes = document?.sceneGraph?.nodes || {};
    const sortedIds = Object.keys(nodes).sort();

    for (const nodeId of sortedIds) {
        const root = findLayoutRoot(nodeId, nodes);
        index.set(nodeId, root);
    }

    return index;
}

function findLayoutRoot(nodeId, nodes) {
    let current = nodes[nodeId];

    while (current) {
        if (isLayoutRoot(current)) {
            return current.id;
        }

        current = nodes[current.parent] || nodes[current.parentId];
    }

    return nodeId;
}

function isLayoutRoot(node) {
    if (!node) return false;
    if (node.type === 'frame') return true;

    if (node.layout && node.layout.mode && node.layout.mode !== 'none') {
        return true;
    }

    return false;
}
