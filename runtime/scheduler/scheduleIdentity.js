import { hashRuntimeState } from '@/core/persistence/hashDocument.js';

function toFiniteNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

export function normalizeSchedulePartitionIds(partitionIds = []) {
    return [...new Set(partitionIds.map((partitionId) => String(partitionId)).filter(Boolean))].sort((left, right) =>
        left.localeCompare(right),
    );
}

export function createCanonicalScheduleSignature({
    partitionIds = [],
    tickTime = 0,
    deltaTime = 0,
} = {}) {
    return hashRuntimeState({
        partitionIds: normalizeSchedulePartitionIds(partitionIds),
        tickTime: toFiniteNumber(tickTime, 0),
        deltaTime: Math.max(0, toFiniteNumber(deltaTime, 0)),
    });
}

export function validateScheduleCheckpoint({
    checkpoint = null,
    scheduleSignature = '',
    partitionCount = 0,
} = {}) {
    if (!checkpoint || typeof checkpoint !== 'object') {
        return Object.freeze({ valid: false, code: 'checkpoint-missing', cursor: 0 });
    }

    if (String(checkpoint.scheduleSignature ?? '') !== String(scheduleSignature ?? '')) {
        return Object.freeze({ valid: false, code: 'checkpoint-signature-mismatch', cursor: 0 });
    }

    const normalizedPartitionCount = Math.max(0, Math.floor(toFiniteNumber(partitionCount, 0)));
    const cursor = Math.max(0, Math.floor(toFiniteNumber(checkpoint.partitionCursor, 0)));
    if (cursor > normalizedPartitionCount) {
        return Object.freeze({ valid: false, code: 'checkpoint-cursor-out-of-range', cursor: 0 });
    }

    return Object.freeze({ valid: true, code: 'checkpoint-valid', cursor });
}

export function assertResumabilityLegality({
    checkpoint = null,
    scheduleSignature = '',
    partitionCount = 0,
} = {}) {
    const validation = validateScheduleCheckpoint({
        checkpoint,
        scheduleSignature,
        partitionCount,
    });
    if (!validation.valid) {
        throw new Error(`Illegal schedule resume: ${validation.code}`);
    }

    return validation;
}
