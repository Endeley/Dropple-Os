import { indexComputedNodeBounds } from './indexNodeBounds.js';
import { removeNodeFromIndex } from './removeNodeFromIndex.js';

export function updateSpatialIndex(scene, dirtyNodes = []) {
    const index = scene?.spatialIndex;
    if (!index) return;

    for (const nodeId of dirtyNodes) {
        removeNodeFromIndex(index, nodeId);
        indexComputedNodeBounds(index, nodeId, scene?.computed?.[nodeId]);
    }
}
