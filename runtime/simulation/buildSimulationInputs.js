function toFiniteNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function normalizeBlendMode(value) {
    return value === 'add' || value === 'replace' ? value : 'replace';
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

function normalizeDampingProfiles(profiles = {}) {
    const entries = Object.entries(profiles)
        .filter(([profileId]) => typeof profileId === 'string' && profileId.length > 0)
        .sort(([left], [right]) => left.localeCompare(right));

    const normalized = {};
    for (const [profileId, profile] of entries) {
        normalized[profileId] = Object.freeze({
            dampingMultiplier: Math.max(0, toFiniteNumber(profile?.dampingMultiplier, 1)),
            springMultiplier: Math.max(0, toFiniteNumber(profile?.springMultiplier, 1)),
        });
    }

    return Object.freeze(normalized);
}

function normalizeSpringChains(chains = [], entitiesById = {}) {
    const normalized = [...(Array.isArray(chains) ? chains : [])]
        .filter((chain) => chain && typeof chain === 'object')
        .map((chain, index) => {
            const members = [...(Array.isArray(chain.members) ? chain.members : [])]
                .map((memberId) => String(memberId))
                .filter((memberId) => entitiesById[memberId]);

            return Object.freeze({
                id: String(chain.id ?? `chain-${index}`),
                members: Object.freeze(members),
                stiffness: Math.max(0, toFiniteNumber(chain.stiffness, 1)),
                damping: Math.max(0, toFiniteNumber(chain.damping, 1)),
                blendMode: normalizeBlendMode(chain.blendMode),
            });
        })
        .sort((left, right) => left.id.localeCompare(right.id));

    return Object.freeze(normalized);
}

function normalizeSpringChainGroups(groups = [], springChains = []) {
    const knownChainIds = new Set(springChains.map((chain) => chain.id));
    const normalized = [...(Array.isArray(groups) ? groups : [])]
        .filter((group) => group && typeof group === 'object')
        .map((group, index) => {
            const chainIds = [...(Array.isArray(group.chainIds) ? group.chainIds : [])]
                .map((chainId) => String(chainId))
                .filter((chainId) => knownChainIds.has(chainId))
                .sort((left, right) => left.localeCompare(right));

            return Object.freeze({
                id: String(group.id ?? `group-${index}`),
                chainIds: Object.freeze(chainIds),
                blendMode: normalizeBlendMode(group.blendMode),
                priority: toFiniteNumber(group.priority, 0),
            });
        })
        .sort((left, right) => {
            const byPriority = left.priority - right.priority;
            return byPriority !== 0 ? byPriority : left.id.localeCompare(right.id);
        });

    return Object.freeze(normalized);
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
    const entitiesById = Object.fromEntries(entities.map((entity) => [entity.id, entity]));
    const simulationConfig = document?.simulation ?? runtime?.simulation?.config ?? {};
    const nodeToPartition = runtime?.scene?.nodeToPartition instanceof Map ? runtime.scene.nodeToPartition : null;
    const springChains = normalizeSpringChains(simulationConfig?.springChains ?? [], entitiesById);
    const springChainGroups = normalizeSpringChainGroups(
        simulationConfig?.springChainGroups ?? [],
        springChains
    );
    const entityProfilesRaw = simulationConfig?.entityProfiles ?? {};
    const entityProfiles = Object.freeze(
        Object.fromEntries(
            Object.entries(entityProfilesRaw)
                .filter(([entityId]) => entitiesById[String(entityId)])
                .map(([entityId, profileId]) => [String(entityId), String(profileId)])
                .sort(([left], [right]) => left.localeCompare(right))
        )
    );

    return Object.freeze({
        time: toFiniteNumber(time, 0),
        deltaTime: Math.max(0, toFiniteNumber(deltaTime, 0)),
        entities: Object.freeze(entities),
        entityPartitionIds: Object.freeze(
            Object.fromEntries(
                entities
                    .map((entity) => [
                        entity.id,
                        String(nodeToPartition?.get(entity.id) ?? '__global__'),
                    ])
                    .sort(([left], [right]) => left.localeCompare(right)),
            ),
        ),
        dampingProfiles: normalizeDampingProfiles(simulationConfig?.dampingProfiles ?? {}),
        entityProfiles,
        springChains,
        springChainGroups,
    });
}
