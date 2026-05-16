import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildSimulationPartitionSchedule,
    createSimulationPartitionCheckpoint,
    createSimulationPartitionScheduleSignature,
} from '@/runtime/simulation/simulationPartitionSchedule.js';

test('simulation partition schedule canonicalizes deterministic ordering', () => {
    const schedule = buildSimulationPartitionSchedule({
        partitionIds: ['p2', 'p0', 'p1', 'p0'],
        tickTime: 16,
        deltaTime: 16,
    });

    assert.deepEqual(schedule.orderedPartitionIds, ['p0', 'p1', 'p2']);
    assert.equal(schedule.partitionCursor, 0);
    assert.deepEqual(schedule.remainingPartitionIds, ['p0', 'p1', 'p2']);
});

test('simulation partition schedule resumes deterministically from matching checkpoint signature', () => {
    const first = buildSimulationPartitionSchedule({
        partitionIds: ['p2', 'p0', 'p1'],
        tickTime: 16,
        deltaTime: 16,
    });
    const checkpoint = createSimulationPartitionCheckpoint({
        ...first,
        partitionCursor: 2,
    });
    const resumed = buildSimulationPartitionSchedule({
        partitionIds: ['p1', 'p2', 'p0'],
        tickTime: 16,
        deltaTime: 16,
        previousCheckpoint: checkpoint,
    });

    assert.equal(resumed.scheduleSignature, first.scheduleSignature);
    assert.equal(resumed.partitionCursor, 2);
    assert.deepEqual(resumed.remainingPartitionIds, ['p2']);
});

test('simulation partition schedule resets cursor when signature changes', () => {
    const first = buildSimulationPartitionSchedule({
        partitionIds: ['p0', 'p1'],
        tickTime: 16,
        deltaTime: 16,
    });
    const checkpoint = createSimulationPartitionCheckpoint({
        ...first,
        partitionCursor: 2,
    });
    const changed = buildSimulationPartitionSchedule({
        partitionIds: ['p0', 'p1', 'p2'],
        tickTime: 32,
        deltaTime: 16,
        previousCheckpoint: checkpoint,
    });

    assert.notEqual(changed.scheduleSignature, first.scheduleSignature);
    assert.equal(changed.partitionCursor, 0);
});

test('partition schedule signature remains deterministic for equivalent ids', () => {
    const left = createSimulationPartitionScheduleSignature({
        partitionIds: ['p2', 'p1', 'p0'],
        tickTime: 16,
        deltaTime: 16,
    });
    const right = createSimulationPartitionScheduleSignature({
        partitionIds: ['p1', 'p0', 'p2', 'p0'],
        tickTime: 16,
        deltaTime: 16,
    });

    assert.equal(left, right);
});
