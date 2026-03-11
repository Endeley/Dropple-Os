export function createPartitionTask({
    partition,
    layers,
    dirtyNodes,
    document,
    runtime,
}) {
    return {
        partitionId: partition.id,
        nodes: [...partition.nodes].filter((nodeId) => dirtyNodes.has(nodeId)),
        layers,
        document,
        runtime,
    };
}
