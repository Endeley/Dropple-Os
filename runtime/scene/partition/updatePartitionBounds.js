export function updatePartitionBounds(scene) {
    const partitions = scene?.partitions;
    const computed = scene?.computed;

    if (!(partitions instanceof Map)) return;

    for (const partition of partitions.values()) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const nodeId of partition.nodes) {
            const bounds = computed?.[nodeId]?.worldBounds;
            if (!bounds) continue;

            minX = Math.min(minX, bounds.x);
            minY = Math.min(minY, bounds.y);
            maxX = Math.max(maxX, bounds.x + bounds.width);
            maxY = Math.max(maxY, bounds.y + bounds.height);
        }

        if (minX === Infinity) {
            partition.bounds = null;
        } else {
            partition.bounds = {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY,
            };
        }
    }
}
