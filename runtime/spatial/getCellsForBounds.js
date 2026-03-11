import { getCellKey } from './getCellKey.js';

export function getCellsForBounds(bounds, cellSize) {
    if (!bounds) return [];

    const minCol = Math.floor(bounds.x / cellSize);
    const maxCol = Math.floor((bounds.x + bounds.width) / cellSize);
    const minRow = Math.floor(bounds.y / cellSize);
    const maxRow = Math.floor((bounds.y + bounds.height) / cellSize);
    const cells = [];

    for (let row = minRow; row <= maxRow; row += 1) {
        for (let col = minCol; col <= maxCol; col += 1) {
            cells.push(getCellKey(col, row));
        }
    }

    return cells;
}
