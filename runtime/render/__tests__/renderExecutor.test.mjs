import test from 'node:test';
import assert from 'node:assert/strict';

import { buildEvaluationInputs } from '@/runtime/animation/buildEvaluationInputs.js';
import { buildExportManifest } from '../exportManifest.js';
import { cancelRenderAssignment, createLocalRenderExecutor, executeRenderAssignment } from '../renderExecutor.js';
import { createRenderQueueState } from '../renderQueue.js';
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
        manifest,
    };
}

test('executeRenderAssignment is deterministic for the same executor and manifest', () => {
    const executor = createLocalRenderExecutor();
    const { renderInput, manifest } = createBundle();

    const left = executeRenderAssignment({
        executor,
        queueState: createRenderQueueState(),
        manifest,
        renderInput,
        mode: 'create',
        priority: 1,
    });
    const right = executeRenderAssignment({
        executor,
        queueState: createRenderQueueState(),
        manifest,
        renderInput,
        mode: 'create',
        priority: 1,
    });

    assert.deepEqual(left, right);
    assert.equal(left.assignment.mode, 'create');
    assert.equal(left.queueEntry?.status, 'running');
});

test('run-mode executor completes queue-driven execution', () => {
    const executor = createLocalRenderExecutor();
    const { renderInput, manifest } = createBundle();

    const result = executeRenderAssignment({
        executor,
        queueState: createRenderQueueState(),
        manifest,
        renderInput,
        mode: 'run',
    });

    assert.equal(result.executionState.status, 'completed');
    assert.equal(result.queueEntry?.status, 'completed');
    assert.equal(result.checkpoint.progress.completedFrameCount, manifest.totalFrames);
});

test('step-mode executor resumes from checkpoint and matches full run', () => {
    const executor = createLocalRenderExecutor();
    const { renderInput, manifest } = createBundle();

    const fullRun = executeRenderAssignment({
        executor,
        queueState: createRenderQueueState(),
        manifest,
        renderInput,
        mode: 'run',
    });

    let partial = executeRenderAssignment({
        executor,
        queueState: createRenderQueueState(),
        manifest,
        renderInput,
        mode: 'create',
    });
    const midpoint = Math.floor(manifest.totalFrames / 2);
    for (let index = 0; index < midpoint; index += 1) {
        partial = executeRenderAssignment({
            executor,
            queueState: partial.queueState,
            manifest,
            renderInput,
            checkpoint: partial.checkpoint,
            mode: 'step',
        });
    }

    const resumed = executeRenderAssignment({
        executor,
        queueState: partial.queueState,
        manifest,
        renderInput,
        checkpoint: partial.checkpoint,
        mode: 'run',
    });

    assert.deepEqual(resumed.executionState, fullRun.executionState);
    assert.deepEqual(resumed.checkpoint, fullRun.checkpoint);
});

test('cancelRenderAssignment cancels without mutating manifest truth', () => {
    const executor = createLocalRenderExecutor();
    const { renderInput, manifest } = createBundle();

    const started = executeRenderAssignment({
        executor,
        queueState: createRenderQueueState(),
        manifest,
        renderInput,
        mode: 'create',
    });
    const cancelled = cancelRenderAssignment({
        executor,
        queueState: started.queueState,
        manifest,
        reason: 'user-cancelled',
    });
    const entry = cancelled.queueState.entries.find((candidate) => candidate.manifestId === manifest.manifestId);

    assert.equal(entry?.status, 'cancelled');
    assert.equal(entry?.error?.message, 'user-cancelled');
    assert.equal(Object.isFrozen(manifest), true);
});
