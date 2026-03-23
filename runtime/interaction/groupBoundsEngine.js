function getNumeric(value) {
    return Number.isFinite(value) ? value : 0;
}

function getNodeBounds(node) {
    const layout = node?.layout ?? {};

    return {
        x: getNumeric(layout.x ?? node?.x),
        y: getNumeric(layout.y ?? node?.y),
        width: getNumeric(layout.width ?? node?.width),
        height: getNumeric(layout.height ?? node?.height),
    };
}

export function computeGroupBounds(nodesById, nodeIds) {
    const sortedIds = Array.isArray(nodeIds)
        ? [...nodeIds].sort((a, b) => String(a).localeCompare(String(b)))
        : [];
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const nodeId of sortedIds) {
        const node = nodesById?.[nodeId];
        if (!node) continue;

        const bounds = getNodeBounds(node);
        minX = Math.min(minX, bounds.x);
        minY = Math.min(minY, bounds.y);
        maxX = Math.max(maxX, bounds.x + bounds.width);
        maxY = Math.max(maxY, bounds.y + bounds.height);
    }

    if (!Number.isFinite(minX)) {
        return null;
    }

    const width = maxX - minX;
    const height = maxY - minY;

    return {
        x: minX,
        y: minY,
        width,
        height,
        center: {
            x: minX + width / 2,
            y: minY + height / 2,
        },
    };
}
