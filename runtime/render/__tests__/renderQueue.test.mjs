import test from 'node:test';
import assert from 'node:assert/strict';

import { buildEvaluationInputs } from '@/runtime/animation/buildEvaluationInputs.js';
import { buildExportManifest } from '../exportManifest.js';
import {
    cancelRenderManifest,
    createRenderQueueState,
    dequeueRenderManifest,
    enqueueRenderManifest,
    markRenderManifestCompleted,
    markRenderManifestFailed,
    markRenderManifestRunning,
} from '../renderQueue.js';
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
                            },
                            {
                                id: 'shot-b',
                                start: 1000,
                                duration: 1000,
                                compositionId: 'comp-b',
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

function createManifest({ type = 'mp4' } = {}) {
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

    return buildExportManifest({
        renderSession: session,
        exportTarget: { type },
    });
}

test('enqueueRenderManifest is deterministic and manifest-addressed', () => {
    const manifest = createManifest();
    const left = enqueueRenderManifest(createRenderQueueState(), manifest, { priority: 2 });
    const right = enqueueRenderManifest(createRenderQueueState(), manifest, { priority: 2 });

    assert.deepEqual(left, right);
    assert.equal(left.entries.length, 1);
    assert.equal(left.entries[0].manifestId, manifest.manifestId);
    assert.equal(left.entries[0].priority, 2);
    assert.equal(left.entries[0].status, 'queued');
});

test('dequeueRenderManifest uses priority first and stable enqueue order second', () => {
    const mp4Manifest = createManifest({ type: 'mp4' });
    const webmManifest = createManifest({ type: 'webm' });

    let queue = createRenderQueueState();
    queue = enqueueRenderManifest(queue, mp4Manifest, { priority: 1 });
    queue = enqueueRenderManifest(queue, webmManifest, { priority: 3 });

    const first = dequeueRenderManifest(queue);

    assert.equal(first.entry?.manifestId, webmManifest.manifestId);
    assert.equal(first.entry?.status, 'dequeued');
    assert.equal(
        first.queueState.entries.find((entry) => entry.manifestId === webmManifest.manifestId)?.status,
        'dequeued',
    );
});

test('queue lifecycle transitions remain coordination-only and deterministic', () => {
    const manifest = createManifest();

    let queue = createRenderQueueState();
    queue = enqueueRenderManifest(queue, manifest, { priority: 1 });
    const dequeued = dequeueRenderManifest(queue);
    queue = markRenderManifestRunning(
        dequeued.queueState,
        manifest.manifestId,
        `${manifest.sessionId}:execution`,
        { completedFrameCount: 3, totalFrames: manifest.totalFrames },
    );
    queue = markRenderManifestCompleted(queue, manifest.manifestId, {
        completedFrameCount: manifest.totalFrames,
        totalFrames: manifest.totalFrames,
    });

    const entry = queue.entries.find((candidate) => candidate.manifestId === manifest.manifestId);
    assert.equal(entry?.status, 'completed');
    assert.equal(entry?.executionId, `${manifest.sessionId}:execution`);
    assert.deepEqual(entry?.progress, {
        completedFrameCount: manifest.totalFrames,
        totalFrames: manifest.totalFrames,
    });
});

test('queue failure and cancellation do not mutate manifest truth', () => {
    const manifest = createManifest();

    let queue = createRenderQueueState();
    queue = enqueueRenderManifest(queue, manifest);
    queue = markRenderManifestFailed(queue, manifest.manifestId, new Error('worker crashed'), {
        completedFrameCount: 2,
        totalFrames: manifest.totalFrames,
    });
    let entry = queue.entries.find((candidate) => candidate.manifestId === manifest.manifestId);

    assert.equal(entry?.status, 'failed');
    assert.equal(entry?.error?.message, 'worker crashed');

    queue = cancelRenderManifest(queue, manifest.manifestId, 'user-cancelled');
    entry = queue.entries.find((candidate) => candidate.manifestId === manifest.manifestId);

    assert.equal(entry?.status, 'cancelled');
    assert.equal(entry?.error?.message, 'user-cancelled');
    assert.equal(manifest.totalFrames > 0, true);
    assert.equal(Object.isFrozen(manifest), true);
});
