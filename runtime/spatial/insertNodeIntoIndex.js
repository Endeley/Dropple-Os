import { getCellsForBounds } from './getCellsForBounds.js';

export function insertNodeIntoIndex(index, nodeId, bounds) {
    if (!index || !nodeId || !bounds) return;

    const cells = getCellsForBounds(bounds, index.cellSize);

    index.nodeCells.set(nodeId, cells);
    index.nodeBounds.set(nodeId, bounds);

    for (const key of cells) {
        if (!index.cells.has(key)) {
            index.cells.set(key, new Set());
        }

        index.cells.get(key).add(nodeId);
    }
}
