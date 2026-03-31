import { insertNodeIntoIndex } from './insertNodeIntoIndex.js';
import { removeNodeFromIndex } from './removeNodeFromIndex.js';

export function updateSpatialIndex(scene, dirtyNodes = []) {
    const index = scene?.spatialIndex;
    if (!index) return;

    for (const nodeId of dirtyNodes) {
        removeNodeFromIndex(index, nodeId);

        const computed = scene?.computed?.[nodeId];
        const bounds = computed?.worldBounds ?? (
            computed
                ? {
                    x: computed.x ?? 0,
                    y: computed.y ?? 0,
                    width: computed.width ?? 0,
                    height: computed.height ?? 0,
                }
                : null
        );

        if (!bounds) continue;

        insertNodeIntoIndex(index, nodeId, bounds);
    }
}
