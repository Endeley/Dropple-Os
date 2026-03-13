export function renderReactLayout(nodeId, layoutMap) {
    const layout = layoutMap[nodeId];

    if (!layout) {
        return {};
    }

    return {
        position: layout.layout === 'absolute' ? 'absolute' : 'relative',
    };
}
