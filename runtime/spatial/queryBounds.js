export function queryBounds(index, rect) {
    if (!index || !rect) return [];

    const { x, y, width, height } = rect;
    const minCol = Math.floor(x / index.cellSize);
    const maxCol = Math.floor((x + width) / index.cellSize);
    const minRow = Math.floor(y / index.cellSize);
    const maxRow = Math.floor((y + height) / index.cellSize);

    const found = new Set();

    for (let row = minRow; row <= maxRow; row += 1) {
        for (let col = minCol; col <= maxCol; col += 1) {
            const key = `${col}:${row}`;
            const bucket = index.cells.get(key);
            if (!bucket) continue;

            for (const nodeId of bucket) {
                found.add(nodeId);
            }
        }
    }

    const hits = [];

    for (const nodeId of [...found].sort()) {
        const b = index.nodeBounds.get(nodeId);
        if (!b) continue;

        const intersects =
            b.x < x + width &&
            b.x + b.width > x &&
            b.y < y + height &&
            b.y + b.height > y;

        if (intersects) hits.push(nodeId);
    }

    return hits;
}
