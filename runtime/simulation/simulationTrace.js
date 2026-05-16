import { hashRuntimeState } from '@/core/persistence/hashDocument.js';

function toFiniteNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function normalizeChainGroup(group) {
    return {
        id: String(group?.id ?? ''),
        priority: toFiniteNumber(group?.priority, 0),
        blendMode: String(group?.blendMode ?? 'replace'),
        chainIds: [...(group?.chainIds ?? [])].map((chainId) => String(chainId)).sort((left, right) => left.localeCompare(right)),
    };
}

function normalizeChain(chain) {
    return {
        id: String(chain?.id ?? ''),
        blendMode: String(chain?.blendMode ?? 'replace'),
        stiffness: toFiniteNumber(chain?.stiffness, 0),
        damping: toFiniteNumber(chain?.damping, 0),
        members: [...(chain?.members ?? [])].map((member) => String(member)).sort((left, right) => left.localeCompare(right)),
    };
}

export function buildConstraintLayerSignature(simulationInputs = {}) {
    const profiles = Object.entries(simulationInputs?.dampingProfiles ?? {})
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([profileId, profile]) => ({
            profileId,
            dampingMultiplier: toFiniteNumber(profile?.dampingMultiplier, 1),
            springMultiplier: toFiniteNumber(profile?.springMultiplier, 1),
        }));
    const entityProfiles = Object.entries(simulationInputs?.entityProfiles ?? {})
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([entityId, profileId]) => ({ entityId, profileId: String(profileId) }));
    const chains = [...(simulationInputs?.springChains ?? [])]
        .map(normalizeChain)
        .sort((left, right) => left.id.localeCompare(right.id));
    const groups = [...(simulationInputs?.springChainGroups ?? [])]
        .map(normalizeChainGroup)
        .sort((left, right) => {
            const byPriority = left.priority - right.priority;
            return byPriority !== 0 ? byPriority : left.id.localeCompare(right.id);
        });

    return hashRuntimeState({
        profiles,
        entityProfiles,
        chains,
        groups,
    });
}

export function recordSimulationTrace({
    previousTrace = null,
    simulationState,
    simulationHash,
    simulationInputs,
    maxEntries = 256,
} = {}) {
    const previousEntries = Array.isArray(previousTrace?.entries) ? previousTrace.entries : [];
    const entry = Object.freeze({
        tickTime: toFiniteNumber(simulationState?.tickTime, 0),
        deltaTime: toFiniteNumber(simulationState?.deltaTime, 0),
        simulationHash: String(simulationHash ?? ''),
        entityCount: Object.keys(simulationState?.entities ?? {}).length,
        constraintLayerSignature: buildConstraintLayerSignature(simulationInputs),
    });

    const nextEntries = [...previousEntries, entry].slice(-Math.max(1, Math.floor(maxEntries)));
    return Object.freeze({
        entries: Object.freeze(nextEntries),
    });
}

export function hashSimulationTrace(trace) {
    const entries = [...(trace?.entries ?? [])]
        .map((entry) => ({
            tickTime: toFiniteNumber(entry?.tickTime, 0),
            deltaTime: toFiniteNumber(entry?.deltaTime, 0),
            simulationHash: String(entry?.simulationHash ?? ''),
            entityCount: Math.max(0, Number(entry?.entityCount ?? 0) || 0),
            constraintLayerSignature: String(entry?.constraintLayerSignature ?? ''),
        }))
        .sort((left, right) => {
            const byTime = left.tickTime - right.tickTime;
            if (byTime !== 0) return byTime;
            const byDelta = left.deltaTime - right.deltaTime;
            if (byDelta !== 0) return byDelta;
            return left.simulationHash.localeCompare(right.simulationHash);
        });

    return hashRuntimeState({ entries });
}
