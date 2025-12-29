export function isAutoLayoutChild(node, nodesById) {
    if (!node?.parentId) return false;
    const parent = nodesById?.[node.parentId];
    return Boolean(parent?.layout && parent.layout.mode !== 'none');
}
