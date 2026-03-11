export function assignNodeToPartition(scene, nodeId) {
    const partitions = scene?.partitions;
    if (!(partitions instanceof Map) || !nodeId) return null;

    for (const [partitionId, partition] of partitions) {
        if (partition?.nodes?.has(nodeId)) {
            return partitionId;
        }
    }

    return null;
}
