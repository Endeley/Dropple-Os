import {
    normalizeSchedulePartitionIds,
    createCanonicalScheduleSignature,
    validateScheduleCheckpoint,
} from '@/runtime/scheduler/scheduleIdentity.js';

function toFiniteNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

export function createSimulationPartitionScheduleSignature({
    partitionIds = [],
    tickTime = 0,
    deltaTime = 0,
} = {}) {
    return createCanonicalScheduleSignature({
        partitionIds,
        tickTime,
        deltaTime,
    });
}

export function buildSimulationPartitionSchedule({
    partitionIds = [],
    tickTime = 0,
    deltaTime = 0,
    previousCheckpoint = null,
} = {}) {
    const orderedPartitionIds = normalizeSchedulePartitionIds(partitionIds);
    const scheduleSignature = createSimulationPartitionScheduleSignature({
        partitionIds: orderedPartitionIds,
        tickTime,
        deltaTime,
    });
    const checkpointValidation = validateScheduleCheckpoint({
        checkpoint: previousCheckpoint,
        scheduleSignature,
        partitionCount: orderedPartitionIds.length,
    });
    const partitionCursor = checkpointValidation.valid ? checkpointValidation.cursor : 0;

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
