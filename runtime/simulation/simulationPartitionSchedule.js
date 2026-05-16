import {
    createSchedulerExecutionEnvelope,
    createSchedulerExecutionCheckpoint,
} from '@/runtime/scheduler/executionEnvelope.js';
import { createCanonicalScheduleSignature, validateScheduleCheckpoint } from '@/runtime/scheduler/scheduleIdentity.js';

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
    const schedule = createSchedulerExecutionEnvelope({
        partitionIds,
        tickTime,
        deltaTime,
        previousCheckpoint,
    });
    // Keep schedule legality explicit at the simulation boundary as required by architecture checks.
    validateScheduleCheckpoint({
        checkpoint: previousCheckpoint,
        scheduleSignature: schedule.scheduleSignature,
        partitionCount: schedule.orderedPartitionIds.length,
    });
    return schedule;
}

export function createSimulationPartitionCheckpoint(schedule) {
    return createSchedulerExecutionCheckpoint(schedule);
}
