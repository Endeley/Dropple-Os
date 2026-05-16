import {
    normalizeSchedulePartitionIds,
    createCanonicalScheduleSignature,
    validateScheduleCheckpoint,
} from './scheduleIdentity.js';

function toFiniteNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

export function createSchedulerExecutionEnvelope({
    partitionIds = [],
    tickTime = 0,
    deltaTime = 0,
    previousCheckpoint = null,
    partitionBudget = null,
} = {}) {
    const orderedPartitionIds = normalizeSchedulePartitionIds(partitionIds);
    const scheduleSignature = createCanonicalScheduleSignature({
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
    const remainingPartitionIds = orderedPartitionIds.slice(partitionCursor);
    const normalizedBudget = Number.isFinite(partitionBudget)
        ? Math.max(0, Math.floor(toFiniteNumber(partitionBudget, 0)))
        : remainingPartitionIds.length;

    return Object.freeze({
        scheduleSignature,
        orderedPartitionIds: Object.freeze(orderedPartitionIds),
        partitionCursor,
        remainingPartitionIds: Object.freeze(remainingPartitionIds),
        partitionBudget: normalizedBudget,
    });
}

export function createSchedulerExecutionCheckpoint(envelope = null) {
    const orderedPartitionIds = [...(envelope?.orderedPartitionIds ?? [])];
    const cursor = Math.min(
        orderedPartitionIds.length,
        Math.max(0, Math.floor(toFiniteNumber(envelope?.partitionCursor, 0))),
    );

    return Object.freeze({
        scheduleSignature: String(envelope?.scheduleSignature ?? ''),
        partitionCursor: cursor,
        completedPartitionIds: Object.freeze(orderedPartitionIds.slice(0, cursor)),
        remainingPartitionIds: Object.freeze(orderedPartitionIds.slice(cursor)),
    });
}
