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
    simulationPartitionSchedule = null,
    simulationPartitionCheckpoint = null,
    maxEntries = 256,
} = {}) {
    const previousEntries = Array.isArray(previousTrace?.entries) ? previousTrace.entries : [];
    const entry = Object.freeze({
        tickTime: toFiniteNumber(simulationState?.tickTime, 0),
        deltaTime: toFiniteNumber(simulationState?.deltaTime, 0),
        simulationHash: String(simulationHash ?? ''),
        entityCount: Object.keys(simulationState?.entities ?? {}).length,
        constraintLayerSignature: buildConstraintLayerSignature(simulationInputs),
        partitionScheduleSignature: String(simulationPartitionSchedule?.scheduleSignature ?? ''),
        partitionIds: Object.freeze([...(simulationPartitionSchedule?.orderedPartitionIds ?? [])].map(String)),
        partitionCursor: Math.max(0, Number(simulationPartitionSchedule?.partitionCursor ?? 0) || 0),
        partitionBudget: Math.max(0, Number(simulationPartitionSchedule?.partitionBudget ?? 0) || 0),
        partitionBudgetPolicy: String(simulationPartitionSchedule?.budgetPolicy ?? ''),
        partitionBudgetCode: String(simulationPartitionSchedule?.budgetCode ?? ''),
        remainingPartitionIds: Object.freeze(
            [...(simulationPartitionSchedule?.remainingPartitionIds ?? [])].map(String),
        ),
        partitionCheckpoint: Object.freeze({
            scheduleSignature: String(simulationPartitionCheckpoint?.scheduleSignature ?? ''),
            partitionCursor: Math.max(0, Number(simulationPartitionCheckpoint?.partitionCursor ?? 0) || 0),
            completedPartitionIds: Object.freeze(
                [...(simulationPartitionCheckpoint?.completedPartitionIds ?? [])].map(String),
            ),
            remainingPartitionIds: Object.freeze(
                [...(simulationPartitionCheckpoint?.remainingPartitionIds ?? [])].map(String),
            ),
        }),
        primitiveTrace: Object.freeze(
            [...(simulationState?.primitiveTrace ?? [])]
                .map((traceEntry) => ({
                    type: String(traceEntry?.type ?? ''),
                    entityId: String(traceEntry?.entityId ?? ''),
                    chainId: String(traceEntry?.chainId ?? ''),
                    memberId: String(traceEntry?.memberId ?? ''),
                    parentId: String(traceEntry?.parentId ?? ''),
                    groupId: String(traceEntry?.groupId ?? ''),
                    partitionId: String(traceEntry?.partitionId ?? ''),
                    scheduleSignature: String(traceEntry?.scheduleSignature ?? ''),
                    chainBlendMode: String(traceEntry?.chainBlendMode ?? ''),
                    groupBlendMode: String(traceEntry?.groupBlendMode ?? ''),
                    blendMode: String(traceEntry?.blendMode ?? ''),
                    spring: toFiniteNumber(traceEntry?.spring, 0),
                    damping: toFiniteNumber(traceEntry?.damping, 0),
                    chainAx: toFiniteNumber(traceEntry?.chainAx, 0),
                    chainAy: toFiniteNumber(traceEntry?.chainAy, 0),
                    ax: toFiniteNumber(traceEntry?.ax, 0),
                    ay: toFiniteNumber(traceEntry?.ay, 0),
                    x: toFiniteNumber(traceEntry?.x, 0),
                    y: toFiniteNumber(traceEntry?.y, 0),
                    vx: toFiniteNumber(traceEntry?.vx, 0),
                    vy: toFiniteNumber(traceEntry?.vy, 0),
                }))
                .sort((left, right) => {
                    const byType = left.type.localeCompare(right.type);
                    if (byType !== 0) return byType;
                    const byEntity = left.entityId.localeCompare(right.entityId);
                    if (byEntity !== 0) return byEntity;
                    const byChain = left.chainId.localeCompare(right.chainId);
                    if (byChain !== 0) return byChain;
                    const byMember = left.memberId.localeCompare(right.memberId);
                    if (byMember !== 0) return byMember;
                    return left.groupId.localeCompare(right.groupId);
                }),
        ),
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
            partitionScheduleSignature: String(entry?.partitionScheduleSignature ?? ''),
            partitionIds: [...(entry?.partitionIds ?? [])].map((partitionId) => String(partitionId)),
            partitionCursor: Math.max(0, Number(entry?.partitionCursor ?? 0) || 0),
            partitionBudget: Math.max(0, Number(entry?.partitionBudget ?? 0) || 0),
            partitionBudgetPolicy: String(entry?.partitionBudgetPolicy ?? ''),
            partitionBudgetCode: String(entry?.partitionBudgetCode ?? ''),
            remainingPartitionIds: [...(entry?.remainingPartitionIds ?? [])].map((partitionId) => String(partitionId)),
            partitionCheckpoint: {
                scheduleSignature: String(entry?.partitionCheckpoint?.scheduleSignature ?? ''),
                partitionCursor: Math.max(0, Number(entry?.partitionCheckpoint?.partitionCursor ?? 0) || 0),
                completedPartitionIds: [...(entry?.partitionCheckpoint?.completedPartitionIds ?? [])].map(
                    (partitionId) => String(partitionId),
                ),
                remainingPartitionIds: [...(entry?.partitionCheckpoint?.remainingPartitionIds ?? [])].map(
                    (partitionId) => String(partitionId),
                ),
            },
            primitiveTrace: [...(entry?.primitiveTrace ?? [])].map((traceEntry) => ({
                type: String(traceEntry?.type ?? ''),
                entityId: String(traceEntry?.entityId ?? ''),
                chainId: String(traceEntry?.chainId ?? ''),
                memberId: String(traceEntry?.memberId ?? ''),
                parentId: String(traceEntry?.parentId ?? ''),
                groupId: String(traceEntry?.groupId ?? ''),
                partitionId: String(traceEntry?.partitionId ?? ''),
                scheduleSignature: String(traceEntry?.scheduleSignature ?? ''),
                chainBlendMode: String(traceEntry?.chainBlendMode ?? ''),
                groupBlendMode: String(traceEntry?.groupBlendMode ?? ''),
                blendMode: String(traceEntry?.blendMode ?? ''),
                spring: toFiniteNumber(traceEntry?.spring, 0),
                damping: toFiniteNumber(traceEntry?.damping, 0),
                chainAx: toFiniteNumber(traceEntry?.chainAx, 0),
                chainAy: toFiniteNumber(traceEntry?.chainAy, 0),
                ax: toFiniteNumber(traceEntry?.ax, 0),
                ay: toFiniteNumber(traceEntry?.ay, 0),
                x: toFiniteNumber(traceEntry?.x, 0),
                y: toFiniteNumber(traceEntry?.y, 0),
                vx: toFiniteNumber(traceEntry?.vx, 0),
                vy: toFiniteNumber(traceEntry?.vy, 0),
            })),
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
