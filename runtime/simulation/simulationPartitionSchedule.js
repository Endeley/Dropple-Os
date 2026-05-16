import {
    createSchedulerExecutionEnvelope,
    createSchedulerExecutionCheckpoint,
} from '@/runtime/scheduler/executionEnvelope.js';
import { createCanonicalScheduleSignature } from '@/runtime/scheduler/scheduleIdentity.js';

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
    return createSchedulerExecutionEnvelope({
        partitionIds,
        tickTime,
        deltaTime,
        previousCheckpoint,
    });
}

export function createSimulationPartitionCheckpoint(schedule) {
    return createSchedulerExecutionCheckpoint(schedule);
}
