function intersects(a, b) {
    return !(
        a.x + a.width < b.x ||
        b.x + b.width < a.x ||
        a.y + a.height < b.y ||
        b.y + b.height < a.y
    );
}

function containsPoint(bounds, x, y) {
    return (
        x >= bounds.x &&
        y >= bounds.y &&
        x <= bounds.x + bounds.width &&
        y <= bounds.y + bounds.height
    );
}

function resolveViewportBounds(runtime) {
    const viewport = runtime?.workspace?.viewport ?? null;

    if (
        Number.isFinite(viewport?.x) &&
        Number.isFinite(viewport?.y) &&
        Number.isFinite(viewport?.width) &&
        Number.isFinite(viewport?.height)
    ) {
        return {
            x: viewport.x,
            y: viewport.y,
            width: viewport.width,
            height: viewport.height,
        };
    }

    return null;
}

function collectCandidatePartitions(runtime, queryRect = null, point = null) {
    const scene = runtime?.scene;
    const partitions = scene?.partitions;

    if (!(partitions instanceof Map)) return null;

    const viewportBounds = resolveViewportBounds(runtime);
    const candidatePartitionIds = new Set();

    for (const [partitionId, partition] of partitions) {
        const bounds = partition?.bounds;
        if (!bounds) continue;

        if (viewportBounds && !intersects(bounds, viewportBounds)) {
            continue;
        }

        if (queryRect && !intersects(bounds, queryRect)) {
            continue;
        }

        if (point && !containsPoint(bounds, point.x, point.y)) {
            continue;
        }

        candidatePartitionIds.add(partitionId);
    }

    return candidatePartitionIds;
}

export function filterCandidatesByPartitions(runtime, candidateNodeIds, options = {}) {
    const nodeToPartition = runtime?.scene?.nodeToPartition;
    if (!(nodeToPartition instanceof Map)) return candidateNodeIds;

    const candidatePartitions = collectCandidatePartitions(
        runtime,
        options.rect ?? null,
        options.point ?? null,
    );

    if (candidatePartitions == null || candidatePartitions.size === 0) {
        return candidateNodeIds;
    }

    return candidateNodeIds.filter((nodeId) => {
        const partitionId = nodeToPartition.get(nodeId);
        return partitionId ? candidatePartitions.has(partitionId) : true;
    });
}
