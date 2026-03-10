import { getCellKey } from './getCellKey.js';

export function indexNodeBounds(index, nodeId, bounds) {
    if (!index || !bounds) return;

    const { x, y, width, height } = bounds;
    const { cellSize } = index;

    const minCol = Math.floor(x / cellSize);
    const maxCol = Math.floor((x + width) / cellSize);
    const minRow = Math.floor(y / cellSize);
    const maxRow = Math.floor((y + height) / cellSize);

    index.nodeBounds.set(nodeId, bounds);

    for (let row = minRow; row <= maxRow; row += 1) {
        for (let col = minCol; col <= maxCol; col += 1) {
            const key = getCellKey(col * cellSize, row * cellSize, cellSize);
            if (!index.cells.has(key)) {
                index.cells.set(key, new Set());
            }
            index.cells.get(key).add(nodeId);
        }
    }
}
