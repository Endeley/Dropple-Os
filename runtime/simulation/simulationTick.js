function toFiniteNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function normalizeSimulationEntity(previousEntity, inputEntity) {
    const id = String(inputEntity.id);
    const x = toFiniteNumber(previousEntity?.x, toFiniteNumber(inputEntity.targetX, 0));
    const y = toFiniteNumber(previousEntity?.y, toFiniteNumber(inputEntity.targetY, 0));
    const vx = toFiniteNumber(previousEntity?.vx, 0);
    const vy = toFiniteNumber(previousEntity?.vy, 0);

    return { id, x, y, vx, vy };
}

function evaluateSpringStep(entity, inputEntity, deltaSeconds, spring, damping) {
    const targetX = toFiniteNumber(inputEntity.targetX, 0);
    const targetY = toFiniteNumber(inputEntity.targetY, 0);

    const ax = (targetX - entity.x) * spring - entity.vx * damping;
    const ay = (targetY - entity.y) * spring - entity.vy * damping;

    const vx = entity.vx + ax * deltaSeconds;
    const vy = entity.vy + ay * deltaSeconds;
    const x = entity.x + vx * deltaSeconds;
    const y = entity.y + vy * deltaSeconds;

    return Object.freeze({
        id: entity.id,
        x,
        y,
        vx,
        vy,
        targetX,
        targetY,
    });
}

export function simulationTick({
    simulationInputs,
    previousSimulationState = null,
    spring = 24,
    damping = 9,
} = {}) {
    const inputs = simulationInputs ?? { entities: [], time: 0, deltaTime: 0 };
    const deltaSeconds = Math.max(0, toFiniteNumber(inputs.deltaTime, 0)) / 1000;
    const previousEntities = previousSimulationState?.entities ?? {};
    const orderedInputEntities = [...(inputs.entities ?? [])]
        .filter((entity) => entity && typeof entity.id !== 'undefined')
        .sort((left, right) => String(left.id).localeCompare(String(right.id)));

    const nextEntities = {};
    for (const inputEntity of orderedInputEntities) {
        const entity = normalizeSimulationEntity(previousEntities[inputEntity.id], inputEntity);
        nextEntities[inputEntity.id] = evaluateSpringStep(
            entity,
            inputEntity,
            deltaSeconds,
            toFiniteNumber(spring, 24),
            toFiniteNumber(damping, 9),
        );
    }

    return Object.freeze({
        tickTime: toFiniteNumber(inputs.time, 0),
        deltaTime: Math.max(0, toFiniteNumber(inputs.deltaTime, 0)),
        entities: Object.freeze(nextEntities),
    });
}
