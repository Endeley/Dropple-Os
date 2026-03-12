export function applyOverrides(node, overrides) {
    if (!node || !overrides) return node;

    const nodeOverrides = overrides[node.id];
    if (nodeOverrides) {
        node.props = {
            ...(node.props || {}),
            ...nodeOverrides,
        };
    }

    if (Array.isArray(node.children)) {
        node.children = node.children.map((child) => applyOverrides(child, overrides));
    }

    return node;
}
