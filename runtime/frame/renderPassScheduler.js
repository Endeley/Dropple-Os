import { createSchedulerExecutionCheckpoint, createSchedulerExecutionEnvelope } from '@/runtime/scheduler/executionEnvelope.js';

function toPassMap(passHandlers = {}) {
    return passHandlers && typeof passHandlers === 'object' ? passHandlers : {};
}

export function createRenderPassExecutionEnvelope({
    envelope = null,
    previousCheckpoint = null,
    budgetPolicy = 'all-remaining',
    passBudget = null,
} = {}) {
    const passIds = [...(envelope?.passIds ?? [])];
    return createSchedulerExecutionEnvelope({
        partitionIds: passIds,
        tickTime: Number(envelope?.frameTime ?? 0),
        deltaTime: 0,
        previousCheckpoint,
        budgetPolicy,
        partitionBudget: passBudget,
    });
}

export function createRenderPassExecutionCheckpoint(executionEnvelope = null) {
    return createSchedulerExecutionCheckpoint(executionEnvelope);
}

export function runDeterministicRenderPasses({
    envelope = null,
    passHandlers = {},
    previousCheckpoint = null,
    budgetPolicy = 'all-remaining',
    passBudget = null,
} = {}) {
    const executionEnvelope = createRenderPassExecutionEnvelope({
        envelope,
        previousCheckpoint,
        budgetPolicy,
        passBudget,
    });
    const handlers = toPassMap(passHandlers);
    const scheduledPassIds = executionEnvelope.remainingPartitionIds.slice(0, executionEnvelope.partitionBudget);

    for (const passId of scheduledPassIds) {
        const handler = handlers[passId];
        if (typeof handler === 'function') handler();
    }

    const nextCursor = executionEnvelope.partitionCursor + scheduledPassIds.length;
    const checkpoint = createRenderPassExecutionCheckpoint({
        ...executionEnvelope,
        partitionCursor: nextCursor,
    });

    return Object.freeze({
        executionEnvelope,
        scheduledPassIds: Object.freeze(scheduledPassIds),
        checkpoint,
        completed: nextCursor >= executionEnvelope.orderedPartitionIds.length,
    });
}

