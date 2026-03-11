export function getCellKey(col, row, cellSize = null) {
    const normalizedCol = cellSize == null ? col : Math.floor(col / cellSize);
    const normalizedRow = cellSize == null ? row : Math.floor(row / cellSize);
    return `${normalizedCol}:${normalizedRow}`;
}
