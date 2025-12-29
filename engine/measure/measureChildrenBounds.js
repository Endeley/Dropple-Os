export function measureChildrenBounds(children) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    children.forEach((child) => {
        const x = child.x ?? 0;
        const y = child.y ?? 0;
        const w = child.width ?? 0;
        const h = child.height ?? 0;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + w);
        maxY = Math.max(maxY, y + h);
    });

    if (minX === Infinity) {
        return { width: 0, height: 0 };
    }

    return {
        width: maxX - minX,
        height: maxY - minY,
    };
}
