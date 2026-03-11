import { createSpatialIndex } from './createSpatialIndex.js';
import { indexNodeBounds } from './indexNodeBounds.js';

export function buildSpatialIndex(runtimeScene, cellSize = 128) {
    const index = createSpatialIndex(cellSize);
    const computed = runtimeScene?.computed || {};
    const nodeIds = Object.keys(computed).sort();

    for (const nodeId of nodeIds) {
        const entry = computed[nodeId];
        if (!entry) continue;

        const bounds = entry.worldBounds ?? {
            x: entry.x ?? 0,
            y: entry.y ?? 0,
            width: entry.width ?? 0,
            height: entry.height ?? 0,
        };

        indexNodeBounds(index, nodeId, bounds);
    }

    return index;
}
