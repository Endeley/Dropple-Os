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

function evaluateSpringStep(entity, inputEntity, deltaSeconds, spring, damping, chainForce = null) {
    const targetX = toFiniteNumber(inputEntity.targetX, 0);
    const targetY = toFiniteNumber(inputEntity.targetY, 0);

    const chainAx = toFiniteNumber(chainForce?.ax, 0);
    const chainAy = toFiniteNumber(chainForce?.ay, 0);

    const ax = (targetX - entity.x) * spring - entity.vx * damping + chainAx;
    const ay = (targetY - entity.y) * spring - entity.vy * damping + chainAy;

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

function buildChainForceMap({ chains, entities, targetsById }) {
    const forceMap = {};

    for (const chain of chains) {
        const members = chain?.members ?? [];
        for (let index = 1; index < members.length; index += 1) {
            const memberId = members[index];
            const parentId = members[index - 1];
            const member = entities[memberId];
            const parent = entities[parentId];
            if (!member || !parent) continue;

            const memberTarget = targetsById[memberId] ?? { targetX: 0, targetY: 0 };
            const parentTarget = targetsById[parentId] ?? { targetX: 0, targetY: 0 };
            const restX = toFiniteNumber(memberTarget.targetX, 0) - toFiniteNumber(parentTarget.targetX, 0);
            const restY = toFiniteNumber(memberTarget.targetY, 0) - toFiniteNumber(parentTarget.targetY, 0);

            const dx = parent.x + restX - member.x;
            const dy = parent.y + restY - member.y;
            const dvx = member.vx - parent.vx;
            const dvy = member.vy - parent.vy;

            const ax = dx * toFiniteNumber(chain?.stiffness, 1) - dvx * toFiniteNumber(chain?.damping, 1);
            const ay = dy * toFiniteNumber(chain?.stiffness, 1) - dvy * toFiniteNumber(chain?.damping, 1);

            const previous = forceMap[memberId] ?? { ax: 0, ay: 0 };
            forceMap[memberId] = {
                ax: previous.ax + ax,
                ay: previous.ay + ay,
            };
        }
    }

    return forceMap;
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
    const dampingProfiles = inputs?.dampingProfiles ?? {};
    const entityProfiles = inputs?.entityProfiles ?? {};
    const springChains = [...(inputs?.springChains ?? [])].sort((left, right) =>
        String(left?.id).localeCompare(String(right?.id))
    );
    const orderedInputEntities = [...(inputs.entities ?? [])]
        .filter((entity) => entity && typeof entity.id !== 'undefined')
        .sort((left, right) => String(left.id).localeCompare(String(right.id)));

    const normalizedEntities = {};
    const targetsById = {};
    for (const inputEntity of orderedInputEntities) {
        normalizedEntities[inputEntity.id] = normalizeSimulationEntity(
            previousEntities[inputEntity.id],
            inputEntity
        );
        targetsById[inputEntity.id] = {
            targetX: toFiniteNumber(inputEntity.targetX, 0),
            targetY: toFiniteNumber(inputEntity.targetY, 0),
        };
    }

    const chainForceMap = buildChainForceMap({
        chains: springChains,
        entities: normalizedEntities,
        targetsById,
    });

    const nextEntities = {};
    for (const inputEntity of orderedInputEntities) {
        const entity = normalizedEntities[inputEntity.id];
        const profileId = entityProfiles[inputEntity.id] ?? null;
        const profile = (profileId && dampingProfiles[profileId]) || null;
        const springMultiplier = Math.max(0, toFiniteNumber(profile?.springMultiplier, 1));
        const dampingMultiplier = Math.max(0, toFiniteNumber(profile?.dampingMultiplier, 1));
        nextEntities[inputEntity.id] = evaluateSpringStep(
            entity,
            inputEntity,
            deltaSeconds,
            toFiniteNumber(spring, 24) * springMultiplier,
            toFiniteNumber(damping, 9) * dampingMultiplier,
            chainForceMap[inputEntity.id] ?? null,
        );
    }

    return Object.freeze({
        tickTime: toFiniteNumber(inputs.time, 0),
        deltaTime: Math.max(0, toFiniteNumber(inputs.deltaTime, 0)),
        entities: Object.freeze(nextEntities),
    });
}
