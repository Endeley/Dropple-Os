export function createSpatialIndex(cellSize = 128) {
    return {
        cellSize,
        cells: new Map(),
        nodeCells: new Map(),
        nodeBounds: new Map(),
    };
}
