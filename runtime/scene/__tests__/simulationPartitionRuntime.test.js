import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateSceneIncremental } from '@/runtime/scene/index.js';

function createDocument() {
    return {
        sceneGraph: {
            rootIds: ['root-a', 'root-b'],
            nodes: {
                'root-a': {
                    id: 'root-a',
                    type: 'frame',
                    children: ['a1'],
                },
                a1: {
                    id: 'a1',
                    type: 'rect',
                    parentId: 'root-a',
                    children: [],
                },
                'root-b': {
                    id: 'root-b',
                    type: 'frame',
                    children: ['b1'],
                },
                b1: {
                    id: 'b1',
                    type: 'rect',
                    parentId: 'root-b',
                    children: [],
                },
            },
        },
    };
}

test('simulation partition scheduling stores deterministic checkpoint + trace attestation', () => {
    const document = createDocument();
    const runtime = {};

    evaluateSceneIncremental({
        event: {
            type: 'node/update',
            payload: { nodeId: 'root-a' },
        },
        document,
        runtime,
    });

    const firstCheckpoint = runtime.simulation.partitionCheckpoint;
    const firstTraceEntry = runtime.simulation.trace.entries.at(-1);

    assert.ok(firstCheckpoint.scheduleSignature.length > 0);
    assert.deepEqual(firstCheckpoint.completedPartitionIds, ['p0']);
    assert.equal(firstCheckpoint.partitionCursor, 1);
    assert.deepEqual(firstTraceEntry.partitionIds, ['p0']);
    assert.equal(firstTraceEntry.partitionCursor, 0);

    evaluateSceneIncremental({
        event: {
            type: 'node/update',
            payload: { nodeId: 'root-a' },
        },
        document,
        runtime,
    });

    const secondTraceEntry = runtime.simulation.trace.entries.at(-1);
    assert.equal(secondTraceEntry.partitionScheduleSignature, firstCheckpoint.scheduleSignature);
    assert.equal(secondTraceEntry.partitionCursor, 1);
    assert.deepEqual(secondTraceEntry.remainingPartitionIds, []);
    assert.deepEqual(secondTraceEntry.partitionCheckpoint.completedPartitionIds, ['p0']);
});
