function ownsLayoutBoundary(layoutNode) {
    if (!layoutNode) return false;
    if (layoutNode.container) return true;
    return layoutNode.mode === 'constraint';
}

export function collectLayoutRoots({
    dirtyNodeIds = [],
    sceneGraph,
    layoutNodes = {},
} = {}) {
    const roots = new Set();
    const graphNodes = sceneGraph?.nodes ?? {};

    dirtyNodeIds.filter(Boolean).forEach((nodeId) => {
        let current = nodeId;
        let foundBoundary = false;

        while (current) {
            const layoutNode = layoutNodes?.[current];

            if (ownsLayoutBoundary(layoutNode)) {
                roots.add(current);
                foundBoundary = true;
                break;
            }

            const parentId = graphNodes?.[current]?.parentId;
            if (!parentId) {
                break;
            }

            current = parentId;
        }

        if (!foundBoundary) {
            roots.add(nodeId);
        }
    });

    return Array.from(roots);
}
