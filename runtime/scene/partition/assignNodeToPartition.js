export function assignNodeToPartition(scene, nodeId) {
    const nodeToPartition = scene?.nodeToPartition;
    if (!(nodeToPartition instanceof Map) || !nodeId) return null;
    return nodeToPartition.get(nodeId) ?? null;
}
