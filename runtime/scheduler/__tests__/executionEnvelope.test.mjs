import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createSchedulerExecutionEnvelope,
    createSchedulerExecutionCheckpoint,
} from '@/runtime/scheduler/executionEnvelope.js';

test('scheduler execution envelope canonicalizes ids and defaults budget to remaining partitions', () => {
    const envelope = createSchedulerExecutionEnvelope({
        partitionIds: ['p2', 'p0', 'p1', 'p0'],
        tickTime: 16,
        deltaTime: 16,
    });

    assert.deepEqual(envelope.orderedPartitionIds, ['p0', 'p1', 'p2']);
    assert.equal(envelope.partitionCursor, 0);
    assert.equal(envelope.partitionBudget, 3);
    assert.equal(envelope.budgetPolicy, 'all-remaining');
    assert.equal(envelope.budgetCode, 'scheduler-budget-all-remaining');
    assert.deepEqual(envelope.remainingPartitionIds, ['p0', 'p1', 'p2']);
});

test('scheduler execution envelope resumes deterministically for valid checkpoint', () => {
    const first = createSchedulerExecutionEnvelope({
        partitionIds: ['p0', 'p1', 'p2'],
        tickTime: 16,
        deltaTime: 16,
    });
    const checkpoint = createSchedulerExecutionCheckpoint({
        ...first,
        partitionCursor: 2,
    });
    const resumed = createSchedulerExecutionEnvelope({
        partitionIds: ['p2', 'p1', 'p0'],
        tickTime: 16,
        deltaTime: 16,
        previousCheckpoint: checkpoint,
    });

    assert.equal(resumed.scheduleSignature, first.scheduleSignature);
    assert.equal(resumed.partitionCursor, 2);
    assert.deepEqual(resumed.remainingPartitionIds, ['p2']);
    assert.equal(resumed.partitionBudget, 1);
});

test('scheduler execution envelope enforces fixed bounded budget policy deterministically', () => {
    const envelope = createSchedulerExecutionEnvelope({
        partitionIds: ['p0', 'p1', 'p2'],
        tickTime: 16,
        deltaTime: 16,
        budgetPolicy: 'fixed',
        partitionBudget: 99,
    });

    assert.equal(envelope.partitionBudget, 3);
    assert.equal(envelope.budgetPolicy, 'fixed');
    assert.equal(envelope.budgetCode, 'scheduler-budget-fixed-bounded');
});

test('scheduler execution envelope resets cursor on illegal checkpoint', () => {
    const first = createSchedulerExecutionEnvelope({
        partitionIds: ['p0', 'p1'],
        tickTime: 16,
        deltaTime: 16,
    });

    const illegal = createSchedulerExecutionEnvelope({
        partitionIds: ['p0', 'p1', 'p2'],
        tickTime: 16,
        deltaTime: 16,
        previousCheckpoint: {
            scheduleSignature: first.scheduleSignature,
            partitionCursor: 9,
        },
        budgetPolicy: 'fixed',
        partitionBudget: 1,
    });

    assert.equal(illegal.partitionCursor, 0);
    assert.equal(illegal.partitionBudget, 1);
    assert.deepEqual(illegal.remainingPartitionIds, ['p0', 'p1', 'p2']);
});
