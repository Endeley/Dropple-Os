import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createRenderExecutionRegistryState,
    getRenderExecutionRecord,
    recordRenderExecutionWorkflow,
} from '../renderExecutionRegistry.js';
import { createExportExecution, runExportExecution, stepExportExecution } from '../exportSession.js';

function createWorkspace() {
    return {
        document: {
            sceneGraph: {
                rootIds: ['fallback-root'],
                nodes: {
                    'fallback-root': { id: 'fallback-root', type: 'frame', children: [] },
                    compA: { id: 'compA', type: 'frame', x: 0, opacity: 1, children: [] },
                    compB: { id: 'compB', type: 'frame', x: 100, opacity: 0.2, children: [] },
                },
                activeSceneId: 'sceneA',
                scenes: [
                    {
                        id: 'sceneA',
                        shots: [
                            {
                                id: 'shotA',
                                start: 0,
                                duration: 1000,
                                compositionId: 'compA',
                                transitionOut: { type: 'crossfade', durationMs: 200 },
                            },
                            {
                                id: 'shotB',
                                start: 1000,
                                duration: 1000,
                                compositionId: 'compB',
                            },
                        ],
                    },
                ],
            },
            sequences: {
                activeSequenceId: 'seqA',
                sequences: {
                    seqA: {
                        id: 'seqA',
                        frameRate: 24,
                        tracks: {},
                    },
                },
            },
            exports: {
                targets: [{ type: 'mp4' }],
            },
        },
        scene: {
            activeSceneId: 'sceneA',
            activeShotId: 'shotA',
        },
        timeline: {
            timelines: {
                default: { tracks: [], duration: 0, events: [] },
            },
        },
        nodes: [],
    };
}

test('recordRenderExecutionWorkflow is deterministic for the same workflow snapshot', () => {
    const workflow = createExportExecution({
        snapshot: createWorkspace(),
    });

    const left = recordRenderExecutionWorkflow(createRenderExecutionRegistryState(), workflow);
    const right = recordRenderExecutionWorkflow(createRenderExecutionRegistryState(), workflow);

    assert.deepEqual(left, right);
    assert.equal(left.records.length, 1);
    assert.equal(left.records[0].manifestId, workflow.manifest.manifestId);
});

test('export workflow records lineage across create, step, and run states', () => {
    let workflow = createExportExecution({
        snapshot: createWorkspace(),
    });
    workflow = stepExportExecution({
        snapshot: createWorkspace(),
        queueState: workflow.queueState,
        checkpoint: workflow.checkpoint,
        registryState: workflow.registryState,
    });
    workflow = runExportExecution({
        snapshot: createWorkspace(),
        queueState: workflow.queueState,
        checkpoint: workflow.checkpoint,
        registryState: workflow.registryState,
    });

    const record = getRenderExecutionRecord(workflow.registryState, workflow.manifest.manifestId);

    assert.equal(record?.status, 'completed');
    assert.equal(record?.terminal, true);
    assert.equal(record?.history.length, 3);
    assert.equal(record?.history[0].status, 'running');
    assert.equal(record?.history.at(-1)?.status, 'completed');
});

test('registry reconstructs one canonical execution identity across resumed and uninterrupted runs', () => {
    let workflow = createExportExecution({
        snapshot: createWorkspace(),
    });
    const midpoint = Math.floor(workflow.manifest.totalFrames / 2);

    for (let index = 0; index < midpoint; index += 1) {
        workflow = stepExportExecution({
            snapshot: createWorkspace(),
            queueState: workflow.queueState,
            checkpoint: workflow.checkpoint,
            registryState: workflow.registryState,
        });
    }

    const resumed = runExportExecution({
        snapshot: createWorkspace(),
        queueState: workflow.queueState,
        checkpoint: workflow.checkpoint,
        registryState: workflow.registryState,
    });
    const uninterrupted = runExportExecution({
        snapshot: createWorkspace(),
    });

    const resumedRecord = getRenderExecutionRecord(resumed.registryState, resumed.manifest.manifestId);
    const uninterruptedRecord = getRenderExecutionRecord(
        uninterrupted.registryState,
        uninterrupted.manifest.manifestId,
    );

    assert.equal(resumedRecord?.recordId, uninterruptedRecord?.recordId);
    assert.equal(resumedRecord?.manifestId, uninterruptedRecord?.manifestId);
    assert.equal(resumedRecord?.sessionId, uninterruptedRecord?.sessionId);
    assert.equal(resumedRecord?.assignmentId, uninterruptedRecord?.assignmentId);
    assert.equal(resumedRecord?.checkpointId, uninterruptedRecord?.checkpointId);
    assert.deepEqual(resumedRecord?.progress, uninterruptedRecord?.progress);
});
