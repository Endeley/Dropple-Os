import { getCellKey } from './getCellKey.js';

export function queryPoint(index, x, y) {
    if (!index) return [];

    const key = getCellKey(x, y, index.cellSize);
    const candidates = index.cells.get(key);

    if (!candidates) return [];

    const hits = [];

    for (const nodeId of [...candidates].sort()) {
        const b = index.nodeBounds.get(nodeId);
        if (!b) continue;

        const inside =
            x >= b.x &&
            y >= b.y &&
            x <= b.x + b.width &&
            y <= b.y + b.height;

        if (inside) hits.push(nodeId);
    }

    return hits;
}
