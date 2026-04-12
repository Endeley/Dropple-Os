import { createSpatialIndex } from './createSpatialIndex.js';
import { indexComputedNodeBounds } from './indexNodeBounds.js';

function getComputedEntries(runtimeScene) {
    const computed = runtimeScene?.computed;

    if (computed instanceof Map) {
        return Array.from(computed.entries()).sort(([leftId], [rightId]) => String(leftId).localeCompare(String(rightId)));
    }

    if (computed && typeof computed === 'object') {
        return Object.entries(computed).sort(([leftId], [rightId]) => String(leftId).localeCompare(String(rightId)));
    }

    return [];
}

export function buildSpatialIndex(runtimeScene, cellSize = 128) {
    const index = createSpatialIndex(cellSize);
    const computedEntries = getComputedEntries(runtimeScene);

    for (const [nodeId, entry] of computedEntries) {
        indexComputedNodeBounds(index, nodeId, entry);
    }

    return index;
}
