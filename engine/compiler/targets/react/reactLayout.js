export function buildLayoutProps(nodeId, layoutMap) {
    const layout = layoutMap[nodeId];

    if (!layout) {
        return '';
    }

    const style = {};

    if (layout.type === 'Stack' || layout.layout === 'stack') {
        style.display = 'flex';
        style.flexDirection = 'column';
    } else if (layout.type === 'Row' || layout.layout === 'row') {
        style.display = 'flex';
        style.flexDirection = 'row';
    } else if (layout.type === 'Grid' || layout.layout === 'grid') {
        style.display = 'grid';
        if (layout.columns) {
            style.gridTemplateColumns = `repeat(${layout.columns}, minmax(0, 1fr))`;
        }
    }

    if (layout.gap !== undefined) {
        style.gap = typeof layout.gap === 'number' ? `${layout.gap}px` : layout.gap;
    }

    if (layout.align) {
        style.alignItems = translateAlign(layout.align);
    }

    if (layout.justify) {
        style.justifyContent = translateAlign(layout.justify);
    }

    const entries = Object.entries(style);
    if (entries.length === 0) {
        return '';
    }

    return `style={{ ${entries
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join(', ')} }}`;
}

function translateAlign(value) {
    if (value === 'start') return 'flex-start';
    if (value === 'end') return 'flex-end';
    return value;
}
