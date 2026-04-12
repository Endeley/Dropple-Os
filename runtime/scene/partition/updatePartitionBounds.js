function normalizeBounds(bounds) {
    if (!bounds) return null;

    const x = Number(bounds.x);
    const y = Number(bounds.y);
    const width = Number(bounds.width);
    const height = Number(bounds.height);

    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(width) || !Number.isFinite(height)) {
        return null;
    }

    return {
        x,
        y,
        width: Math.max(0, width),
        height: Math.max(0, height),
    };
}

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
            const bounds = normalizeBounds(computed?.[nodeId]?.worldBounds);
            if (!bounds) continue;

            minX = Math.min(minX, bounds.x);
            minY = Math.min(minY, bounds.y);
            maxX = Math.max(maxX, bounds.x + bounds.width);
            maxY = Math.max(maxY, bounds.y + bounds.height);
        }

        if (minX === Infinity) {
            partition.bounds = null;
            continue;
        }

        partition.bounds = {
            x: minX,
            y: minY,
            width: Math.max(0, maxX - minX),
            height: Math.max(0, maxY - minY),
        };
    }
}
