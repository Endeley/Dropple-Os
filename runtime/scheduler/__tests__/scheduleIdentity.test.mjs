import test from 'node:test';
import assert from 'node:assert/strict';

import {
    normalizeSchedulePartitionIds,
    createCanonicalScheduleSignature,
    validateScheduleCheckpoint,
    assertResumabilityLegality,
} from '@/runtime/scheduler/scheduleIdentity.js';

test('normalizeSchedulePartitionIds is deterministic and unique', () => {
    assert.deepEqual(normalizeSchedulePartitionIds(['p2', 'p0', 'p1', 'p0']), ['p0', 'p1', 'p2']);
});

test('createCanonicalScheduleSignature is insertion-order invariant', () => {
    const left = createCanonicalScheduleSignature({
        partitionIds: ['p2', 'p0', 'p1'],
        tickTime: 16,
        deltaTime: 16,
    });
    const right = createCanonicalScheduleSignature({
        partitionIds: ['p1', 'p2', 'p0', 'p0'],
        tickTime: 16,
        deltaTime: 16,
    });

    assert.equal(left, right);
});

test('validateScheduleCheckpoint is fail-closed for illegal resume metadata', () => {
    const signature = createCanonicalScheduleSignature({
        partitionIds: ['p0', 'p1'],
        tickTime: 16,
        deltaTime: 16,
    });

    assert.equal(
        validateScheduleCheckpoint({
            checkpoint: null,
            scheduleSignature: signature,
            partitionCount: 2,
        }).valid,
        false,
    );
    assert.equal(
        validateScheduleCheckpoint({
            checkpoint: { scheduleSignature: 'bad', partitionCursor: 1 },
            scheduleSignature: signature,
            partitionCount: 2,
        }).valid,
        false,
    );
    assert.equal(
        validateScheduleCheckpoint({
            checkpoint: { scheduleSignature: signature, partitionCursor: 9 },
            scheduleSignature: signature,
            partitionCount: 2,
        }).valid,
        false,
    );
});

test('assertResumabilityLegality returns deterministic cursor on legal checkpoint', () => {
    const signature = createCanonicalScheduleSignature({
        partitionIds: ['p0', 'p1'],
        tickTime: 16,
        deltaTime: 16,
    });
    const result = assertResumabilityLegality({
        checkpoint: { scheduleSignature: signature, partitionCursor: 1 },
        scheduleSignature: signature,
        partitionCount: 2,
    });

    assert.equal(result.valid, true);
    assert.equal(result.cursor, 1);
});
