import test from 'node:test';
import assert from 'node:assert/strict';

import { buildEvaluationInputs } from '@/runtime/animation/buildEvaluationInputs.js';
import { buildExportManifest } from '../exportManifest.js';
import {
    buildRenderExecutionCheckpoint,
    buildRenderProgressSnapshot,
    buildSessionFromManifest,
    resumeRenderExecutionCheckpoint,
} from '../renderProgress.js';
import { buildRenderSession } from '../renderSession.js';
import { createRenderSessionExecution, stepRenderSessionExecution } from '../renderSessionExecution.js';

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

function createBundle() {
    const inputs = buildEvaluationInputs(createTransitionRuntimeSnapshot(), {
        timeMs: 900,
        strictSceneScope: true,
    });
    const renderSession = buildRenderSession({
        renderInput: inputs.renderInput,
        fromMs: 0,
        toMs: 1000,
        framePolicy: { mode: 'sequence-frame-rate' },
        samplePolicy: { mode: 'stability-preflight', sampleCount: 4, includeTransitionBoundaries: true },
    });
    const manifest = buildExportManifest({
        renderSession,
        exportTarget: { type: 'mp4' },
    });

    return {
        renderInput: inputs.renderInput,
        renderSession,
        manifest,
    };
}

test('buildRenderProgressSnapshot is deterministic for the same execution state', () => {
    const { renderInput, renderSession } = createBundle();
    let executionState = createRenderSessionExecution({
        session: renderSession,
        renderInput,
    });
    executionState = stepRenderSessionExecution(executionState);

    const left = buildRenderProgressSnapshot(executionState);
    const right = buildRenderProgressSnapshot(executionState);

    assert.deepEqual(left, right);
    assert.equal(left.completedFrameCount, 1);
    assert.equal(left.frameCursor, 1);
});

test('buildRenderExecutionCheckpoint is deterministic and resumable', () => {
    const { renderInput, manifest, renderSession } = createBundle();
    let executionState = createRenderSessionExecution({
        session: renderSession,
        renderInput,
    });
    executionState = stepRenderSessionExecution(executionState);
    executionState = stepRenderSessionExecution(executionState);

    const left = buildRenderExecutionCheckpoint({
        manifest,
        executionState,
    });
    const right = buildRenderExecutionCheckpoint({
        manifest,
        executionState,
    });
    const resumed = resumeRenderExecutionCheckpoint({
        manifest,
        renderInput,
        checkpoint: left,
    });

    assert.deepEqual(left, right);
    assert.equal(left.manifestId, manifest.manifestId);
    assert.equal(left.sessionId, manifest.sessionId);
    assert.equal(left.progress.completedFrameCount, 2);
    assert.deepEqual(resumed.completedFrames, executionState.completedFrames);
    assert.equal(resumed.frameCursor, executionState.frameCursor);
});

test('buildSessionFromManifest preserves canonical schedule truth', () => {
    const { manifest } = createBundle();
    const session = buildSessionFromManifest(manifest);

    assert.equal(session.sessionId, manifest.sessionId);
    assert.deepEqual(session.frameTimes, manifest.frameTimes);
    assert.deepEqual(session.sampleTimes, manifest.sampleTimes);
    assert.equal(session.totalFrames, manifest.totalFrames);
});
