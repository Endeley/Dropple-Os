export function unionBounds(boundsList) {
    if (!boundsList.length) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const bounds of boundsList) {
        if (!bounds) continue;

        if (bounds.x < minX) minX = bounds.x;
        if (bounds.y < minY) minY = bounds.y;
        if (bounds.x + bounds.width > maxX) maxX = bounds.x + bounds.width;
        if (bounds.y + bounds.height > maxY) maxY = bounds.y + bounds.height;
    }

    if (!Number.isFinite(minX)) return null;

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
}
