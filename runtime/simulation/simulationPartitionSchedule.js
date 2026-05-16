import { hashRuntimeState } from '@/core/persistence/hashDocument.js';

function toFiniteNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function normalizePartitionIds(partitionIds = []) {
    return [...new Set(partitionIds.map((partitionId) => String(partitionId)).filter(Boolean))].sort((left, right) =>
        left.localeCompare(right),
    );
}

export function createSimulationPartitionScheduleSignature({
    partitionIds = [],
    tickTime = 0,
    deltaTime = 0,
} = {}) {
    return hashRuntimeState({
        partitionIds: normalizePartitionIds(partitionIds),
        tickTime: toFiniteNumber(tickTime, 0),
        deltaTime: Math.max(0, toFiniteNumber(deltaTime, 0)),
    });
}

export function buildSimulationPartitionSchedule({
    partitionIds = [],
    tickTime = 0,
    deltaTime = 0,
    previousCheckpoint = null,
} = {}) {
    const orderedPartitionIds = normalizePartitionIds(partitionIds);
    const scheduleSignature = createSimulationPartitionScheduleSignature({
        partitionIds: orderedPartitionIds,
        tickTime,
        deltaTime,
    });
    const checkpointSignature = String(previousCheckpoint?.scheduleSignature ?? '');
    const checkpointCursor = Math.max(0, Math.floor(toFiniteNumber(previousCheckpoint?.partitionCursor, 0)));
    const partitionCursor = checkpointSignature === scheduleSignature
        ? Math.min(checkpointCursor, orderedPartitionIds.length)
        : 0;

    return Object.freeze({
        scheduleSignature,
        orderedPartitionIds: Object.freeze(orderedPartitionIds),
        partitionCursor,
        remainingPartitionIds: Object.freeze(orderedPartitionIds.slice(partitionCursor)),
    });
}

export function createSimulationPartitionCheckpoint(schedule) {
    const orderedPartitionIds = [...(schedule?.orderedPartitionIds ?? [])];
    const cursor = Math.min(
        orderedPartitionIds.length,
        Math.max(0, Math.floor(toFiniteNumber(schedule?.partitionCursor, 0))),
    );

    return Object.freeze({
        scheduleSignature: String(schedule?.scheduleSignature ?? ''),
        partitionCursor: cursor,
        completedPartitionIds: Object.freeze(orderedPartitionIds.slice(0, cursor)),
        remainingPartitionIds: Object.freeze(orderedPartitionIds.slice(cursor)),
    });
}
