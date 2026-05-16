import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildFrameExecutionPartitionIds,
    buildFrameExecutionEnvelope,
    buildFrameExecutionCheckpoint,
    assertFrameExecutionCheckpointLegality,
} from '@/runtime/scheduler/frameExecutionSchedule.js';

test('frame execution partition ids are canonical and deterministic', () => {
    const ids = buildFrameExecutionPartitionIds([0, 16, 32]);
    assert.deepEqual(ids, ['frame:0', 'frame:1', 'frame:2']);
});

test('frame execution checkpoint legality passes for matching signature + cursor', () => {
    const checkpoint = buildFrameExecutionCheckpoint({
        frameTimes: [0, 16, 32],
        frameCursor: 2,
    });
    const legality = assertFrameExecutionCheckpointLegality({
        frameTimes: [0, 16, 32],
        checkpoint,
    });

    assert.equal(legality.legality.valid, true);
    assert.equal(legality.legality.cursor, 2);
    assert.equal(legality.envelope.scheduleSignature, checkpoint.scheduleSignature);
});

test('frame execution checkpoint legality fails closed for signature mismatch', () => {
    assert.throws(
        () =>
            assertFrameExecutionCheckpointLegality({
                frameTimes: [0, 16, 32],
                checkpoint: {
                    scheduleSignature: 'bad-signature',
                    partitionCursor: 1,
                },
            }),
        /Illegal schedule resume:/,
    );
});

test('frame execution envelope can bound fixed budget deterministically', () => {
    const envelope = buildFrameExecutionEnvelope({
        frameTimes: [0, 16, 32],
        budgetPolicy: 'fixed',
        partitionBudget: 1,
    });
    assert.equal(envelope.partitionBudget, 1);
    assert.equal(envelope.budgetPolicy, 'fixed');
});
