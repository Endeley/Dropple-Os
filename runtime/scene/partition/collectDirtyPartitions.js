import { assignNodeToPartition } from './assignNodeToPartition.js';

export function collectDirtyPartitions(scene, dirtyNodes) {
    const dirtyPartitions = new Set();

    for (const nodeId of dirtyNodes) {
        const partitionId = assignNodeToPartition(scene, nodeId);
        if (!partitionId) continue;

        dirtyPartitions.add(partitionId);

        const partition = scene?.partitions?.get(partitionId);
        if (partition) {
            partition.dirty = true;
        }
    }

    return dirtyPartitions;
}
