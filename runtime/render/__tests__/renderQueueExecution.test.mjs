import test from 'node:test';
import assert from 'node:assert/strict';

import { buildEvaluationInputs } from '@/runtime/animation/buildEvaluationInputs.js';
import { buildExportManifest } from '../exportManifest.js';
import { createRenderQueueState } from '../renderQueue.js';
import {
    cancelRenderQueueExecution,
    createRenderQueueExecution,
    runRenderQueueExecution,
    stepRenderQueueExecution,
} from '../renderQueueExecution.js';
import { buildRenderSession } from '../renderSession.js';

function createTransitionRuntimeSnapshot() {
    return {
        document: {
            sceneGraph: {
                activeSceneId: 'scene-1',
                rootIds: ['fallback-root', 'comp-a', 'comp-b'],
                nodes: {
                    'fallback-root': { id: 'fallback-root', type: 'frame', children: [] },
                    'comp-a': { id: 'comp-a', type: 'frame', children: [] },
                    'comp-b': { id: 'comp-b', type: 'frame', children: [] },
                },
                scenes: [
                    {
                        id: 'scene-1',
                        shots: [
                            {
                                id: 'shot-a',
                                start: 0,
                                duration: 1000,
                                compositionId: 'comp-a',
                                transitionOut: { type: 'crossfade', durationMs: 200 },
                                camera: {
                                    keyframes: [{ time: 0, x: 320, y: 180, zoom: 1.25, rotation: 12 }],
                                },
                            },
                            {
                                id: 'shot-b',
                                start: 1000,
                                duration: 1000,
                                compositionId: 'comp-b',
                                camera: {
                                    keyframes: [{ time: 0, x: 640, y: 360, zoom: 2, rotation: 24 }],
                                },
                            },
                        ],
                    },
                ],
            },
            sequences: {
                activeSequenceId: 'seq-1',
                sequences: {
                    'seq-1': {
                        id: 'seq-1',
                        frameRate: 24,
                        tracks: {},
                    },
                },
            },
        },
        playback: {
            timeMs: 900,
        },
        scene: {
            activeSceneId: 'scene-1',
            activeShotId: 'shot-a',
            computed: {},
            transformDirty: new Set(),
            layoutDirty: new Set(),
            paintDirty: new Set(),
            indexDirty: new Set(),
            layoutRoots: new Map(),
            dependencyGraph: null,
            spatialIndex: null,
        },
        timeline: {
            timelines: {
                default: { tracks: [], duration: 0, events: [] },
            },
        },
    };
}

function createBundle({ type = 'mp4' } = {}) {
    const inputs = buildEvaluationInputs(createTransitionRuntimeSnapshot(), {
        timeMs: 900,
        strictSceneScope: true,
    });
    const session = buildRenderSession({
        renderInput: inputs.renderInput,
        fromMs: 0,
        toMs: 1000,
        framePolicy: { mode: 'sequence-frame-rate' },
        samplePolicy: { mode: 'stability-preflight', sampleCount: 4, includeTransitionBoundaries: true },
    });
    const manifest = buildExportManifest({
        renderSession: session,
        exportTarget: { type },
    });

    return {
        renderInput: inputs.renderInput,
        session,
        manifest,
    };
}

test('createRenderQueueExecution binds manifest, queue, and execution deterministically', () => {
    const { renderInput, manifest } = createBundle();

    const left = createRenderQueueExecution({
        queueState: createRenderQueueState(),
        manifest,
        renderInput,
        priority: 2,
    });
    const right = createRenderQueueExecution({
        queueState: createRenderQueueState(),
        manifest,
        renderInput,
        priority: 2,
    });

    assert.deepEqual(left, right);
    assert.equal(left.queueEntry?.status, 'running');
    assert.equal(left.queueEntry?.executionId, left.executionState.executionId);
    assert.equal(left.queueEntry?.progress?.completedFrameCount, 0);
});

test('runRenderQueueExecution completes queue and execution together', () => {
    const { renderInput, manifest } = createBundle();

    const result = runRenderQueueExecution({
        queueState: createRenderQueueState(),
        manifest,
        renderInput,
    });

    assert.equal(result.executionState.status, 'completed');
    assert.equal(result.queueEntry?.status, 'completed');
    assert.equal(result.queueEntry?.progress?.completedFrameCount, manifest.totalFrames);
});

test('stepped queue execution equals full run from midpoint', () => {
    const { renderInput, manifest } = createBundle();

    const fullRun = runRenderQueueExecution({
        queueState: createRenderQueueState(),
        manifest,
        renderInput,
    });

    let partial = createRenderQueueExecution({
        queueState: createRenderQueueState(),
        manifest,
        renderInput,
    });
    const midpoint = Math.floor(manifest.totalFrames / 2);
    for (let index = 0; index < midpoint; index += 1) {
        partial = stepRenderQueueExecution({
            queueState: partial.queueState,
            manifest,
            renderInput,
            checkpoint: partial.checkpoint,
        });
    }

    const resumed = runRenderQueueExecution({
        queueState: partial.queueState,
        manifest,
        renderInput,
        checkpoint: partial.checkpoint,
    });

    assert.deepEqual(resumed.executionState, fullRun.executionState);
    assert.equal(resumed.queueEntry?.status, 'completed');
    assert.deepEqual(resumed.queueEntry?.progress, fullRun.queueEntry?.progress);
});

test('cancelRenderQueueExecution remains coordination-only', () => {
    const { manifest } = createBundle();
    let queueState = createRenderQueueState();
    queueState = createRenderQueueExecution({
        queueState,
        manifest,
        renderInput: createBundle().renderInput,
    }).queueState;

    const cancelled = cancelRenderQueueExecution({
        queueState,
        manifest,
        reason: 'user-cancelled',
    });
    const entry = cancelled.entries.find((candidate) => candidate.manifestId === manifest.manifestId);

    assert.equal(entry?.status, 'cancelled');
    assert.equal(entry?.error?.message, 'user-cancelled');
    assert.equal(Object.isFrozen(manifest), true);
});
