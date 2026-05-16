import test from 'node:test';
import assert from 'node:assert/strict';

import { exportDroppleSpec } from '@/runtime/export/exportDroppleSpec.js';
import {
    createExportExecution,
    performExportExecution,
    runExportExecution,
    stepExportExecution,
} from '../exportSession.js';

function createWorkspace() {
    return {
        runtime: {
            simulation: {
                trace: {
                    entries: [
                        {
                            tickTime: 16,
                            deltaTime: 16,
                            simulationHash: 'sim-hash-1',
                            entityCount: 2,
                            constraintLayerSignature: 'layer-a',
                        },
                        {
                            tickTime: 32,
                            deltaTime: 16,
                            simulationHash: 'sim-hash-2',
                            entityCount: 2,
                            constraintLayerSignature: 'layer-a',
                        },
                    ],
                },
            },
        },
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

test('createExportExecution builds canonical export workflow descriptors', () => {
    const workflow = createExportExecution({
        snapshot: createWorkspace(),
    });

    assert.equal(workflow.manifest.exportTarget.type, 'mp4');
    assert.equal(workflow.assignment.mode, 'create');
    assert.equal(workflow.queueEntry?.status, 'running');
    assert.equal(workflow.progress?.completedFrameCount, 0);
    assert.equal(typeof workflow.manifest.simulationTraceFingerprint, 'string');
    assert.ok(workflow.manifest.simulationTraceFingerprint.length > 0);
});

test('stepExportExecution resumes from checkpoint deterministically', () => {
    let workflow = createExportExecution({
        snapshot: createWorkspace(),
    });
    const midpoint = Math.floor(workflow.manifest.totalFrames / 2);

    for (let index = 0; index < midpoint; index += 1) {
        workflow = stepExportExecution({
            snapshot: createWorkspace(),
            queueState: workflow.queueState,
            checkpoint: workflow.checkpoint,
        });
    }

    const resumed = runExportExecution({
        snapshot: createWorkspace(),
        queueState: workflow.queueState,
        checkpoint: workflow.checkpoint,
    });
    const fullRun = runExportExecution({
        snapshot: createWorkspace(),
    });

    assert.deepEqual(resumed.executionState, fullRun.executionState);
    assert.deepEqual(resumed.checkpoint, fullRun.checkpoint);
});

test('resumed and uninterrupted export workflows preserve canonical execution identity', () => {
    let workflow = createExportExecution({
        snapshot: createWorkspace(),
    });
    const midpoint = Math.floor(workflow.manifest.totalFrames / 2);

    for (let index = 0; index < midpoint; index += 1) {
        workflow = stepExportExecution({
            snapshot: createWorkspace(),
            queueState: workflow.queueState,
            checkpoint: workflow.checkpoint,
        });
    }

    const resumed = runExportExecution({
        snapshot: createWorkspace(),
        queueState: workflow.queueState,
        checkpoint: workflow.checkpoint,
    });
    const uninterrupted = runExportExecution({
        snapshot: createWorkspace(),
    });

    assert.equal(resumed.manifest.manifestId, uninterrupted.manifest.manifestId);
    assert.equal(resumed.renderSession.sessionId, uninterrupted.renderSession.sessionId);
    assert.equal(resumed.executionState.executionId, uninterrupted.executionState.executionId);
    assert.equal(resumed.assignment.manifestId, uninterrupted.assignment.manifestId);
    assert.equal(resumed.queueEntry?.executionId, uninterrupted.queueEntry?.executionId);
    assert.equal(resumed.manifest.simulationTraceFingerprint, uninterrupted.manifest.simulationTraceFingerprint);
});

test('trace fingerprint is replay-order invariant for equivalent trace entries', () => {
    const first = createWorkspace();
    const second = createWorkspace();
    second.runtime.simulation.trace.entries = [...second.runtime.simulation.trace.entries].reverse();

    const firstWorkflow = createExportExecution({ snapshot: first });
    const secondWorkflow = createExportExecution({ snapshot: second });

    assert.equal(
        firstWorkflow.manifest.simulationTraceFingerprint,
        secondWorkflow.manifest.simulationTraceFingerprint,
    );
});

test('performExportExecution preserves canonical export semantics', () => {
    const workflow = runExportExecution({
        snapshot: createWorkspace(),
    });
    const spec = performExportExecution(workflow);

    assert.equal(spec.media.exports.targets[0].type, 'mp4');
    assert.equal(spec.media.sequences.activeSequenceId, 'seqA');
});

test('exportDroppleSpec routes through the canonical export workflow boundary', () => {
    const spec = exportDroppleSpec({
        snapshot: createWorkspace(),
    });

    assert.equal(spec.media.exports.targets[0].id, 'mp4:master');
});
