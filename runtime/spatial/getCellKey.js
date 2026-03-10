export function getCellKey(x, y, cellSize) {
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    return `${col}:${row}`;
}
