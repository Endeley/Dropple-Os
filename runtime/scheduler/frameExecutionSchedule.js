import { createSchedulerExecutionEnvelope, createSchedulerExecutionCheckpoint } from './executionEnvelope.js';
import { assertResumabilityLegality } from './scheduleIdentity.js';

export function buildFrameExecutionPartitionIds(frameTimes = []) {
    return [...(frameTimes ?? [])].map((_, index) => `frame:${index}`);
}

export function buildFrameExecutionEnvelope({
    frameTimes = [],
    previousCheckpoint = null,
    budgetPolicy = 'all-remaining',
    partitionBudget = null,
} = {}) {
    return createSchedulerExecutionEnvelope({
        partitionIds: buildFrameExecutionPartitionIds(frameTimes),
        tickTime: 0,
        deltaTime: 0,
        previousCheckpoint,
        budgetPolicy,
        partitionBudget,
    });
}

export function assertFrameExecutionCheckpointLegality({
    frameTimes = [],
    checkpoint = null,
} = {}) {
    const envelope = buildFrameExecutionEnvelope({
        frameTimes,
        previousCheckpoint: checkpoint,
    });
    const legality = assertResumabilityLegality({
        checkpoint,
        scheduleSignature: envelope.scheduleSignature,
        partitionCount: envelope.orderedPartitionIds.length,
    });

    return Object.freeze({
        envelope,
        legality,
    });
}

export function buildFrameExecutionCheckpoint({
    frameTimes = [],
    frameCursor = 0,
} = {}) {
    const envelope = buildFrameExecutionEnvelope({
        frameTimes,
    });
    return createSchedulerExecutionCheckpoint({
        ...envelope,
        partitionCursor: frameCursor,
    });
}
