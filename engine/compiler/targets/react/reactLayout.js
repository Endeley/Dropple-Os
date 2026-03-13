export function buildLayoutProps(nodeId, layoutMap) {
    const layout = layoutMap[nodeId];

    if (!layout) {
        return '';
    }

    if (layout.layout === 'stack') {
        return 'style={{ display: "flex", flexDirection: "column" }}';
    }

    if (layout.layout === 'row') {
        return 'style={{ display: "flex", flexDirection: "row" }}';
    }

    if (layout.layout === 'grid') {
        return 'style={{ display: "grid" }}';
    }

    return '';
}
