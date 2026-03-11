function intersects(a, b) {
    return !(
        a.x + a.width < b.x ||
        b.x + b.width < a.x ||
        a.y + a.height < b.y ||
        b.y + b.height < a.y
    );
}

export function collectVisiblePartitions(scene, viewport) {
    const partitions = scene?.partitions;
    const visible = new Set();

    if (!(partitions instanceof Map)) return visible;

    for (const [partitionId, partition] of partitions) {
        if (!partition.bounds) {
            partition.visible = true;
            visible.add(partitionId);
            continue;
        }

        const isVisible = intersects(partition.bounds, viewport);
        partition.visible = isVisible;

        if (isVisible) {
            visible.add(partitionId);
        }
    }

    return visible;
}
