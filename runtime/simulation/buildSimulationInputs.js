function toFiniteNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function normalizeNodeTarget(nodeId, node, computedEntry) {
    const computedX = toFiniteNumber(computedEntry?.x, null);
    const computedY = toFiniteNumber(computedEntry?.y, null);
    const layoutX = toFiniteNumber(node?.layout?.x, null);
    const layoutY = toFiniteNumber(node?.layout?.y, null);

    return Object.freeze({
        id: String(nodeId),
        targetX: computedX ?? layoutX ?? 0,
        targetY: computedY ?? layoutY ?? 0,
    });
}

export function buildSimulationInputs({
    document,
    runtime,
    time = 0,
    deltaTime = 0,
} = {}) {
    const sceneNodes = document?.sceneGraph?.nodes ?? {};
    const computed = runtime?.scene?.computed ?? {};
    const entityIds = Object.keys(sceneNodes).sort((left, right) => left.localeCompare(right));
    const entities = entityIds.map((nodeId) =>
        normalizeNodeTarget(nodeId, sceneNodes[nodeId], computed[nodeId] ?? null)
    );

    return Object.freeze({
        time: toFiniteNumber(time, 0),
        deltaTime: Math.max(0, toFiniteNumber(deltaTime, 0)),
        entities: Object.freeze(entities),
    });
}
