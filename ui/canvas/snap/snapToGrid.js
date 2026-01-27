export function snapToGrid(value, gridSize) {
    return Math.round(value / gridSize) * gridSize;
}
