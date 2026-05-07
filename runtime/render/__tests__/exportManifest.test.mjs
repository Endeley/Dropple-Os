import test from 'node:test';
import assert from 'node:assert/strict';

import { buildEvaluationInputs } from '@/runtime/animation/buildEvaluationInputs.js';
import { EXPORT_CANONICAL_VERSION, EXPORT_HASH_ALGORITHM } from '@/runtime/export/exportFingerprint.js';
import { buildRenderSession } from '../renderSession.js';
import { buildExportManifest } from '../exportManifest.js';

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

function createSession() {
    const inputs = buildEvaluationInputs(createTransitionRuntimeSnapshot(), {
        timeMs: 900,
        strictSceneScope: true,
    });

    return buildRenderSession({
        renderInput: inputs.renderInput,
        fromMs: 0,
        toMs: 1000,
        framePolicy: { mode: 'sequence-frame-rate' },
        samplePolicy: { mode: 'stability-preflight', sampleCount: 4, includeTransitionBoundaries: true },
    });
}

test('buildExportManifest is deterministic for the same session and export target', () => {
    const session = createSession();
    const target = { type: 'mp4' };

    const left = buildExportManifest({
        renderSession: session,
        exportTarget: target,
    });
    const right = buildExportManifest({
        renderSession: session,
        exportTarget: target,
    });

    assert.equal(left.manifestId, right.manifestId);
    assert.deepEqual(left, right);
});

test('buildExportManifest changes identity when export target changes', () => {
    const session = createSession();

    const mp4Manifest = buildExportManifest({
        renderSession: session,
        exportTarget: { type: 'mp4' },
    });
    const webmManifest = buildExportManifest({
        renderSession: session,
        exportTarget: { type: 'webm' },
    });

    assert.notEqual(mp4Manifest.manifestId, webmManifest.manifestId);
    assert.notDeepEqual(mp4Manifest.exportTarget, webmManifest.exportTarget);
});

test('buildExportManifest preserves canonical render session schedule truth', () => {
    const session = createSession();
    const manifest = buildExportManifest({
        renderSession: session,
        exportTarget: { type: 'mp4' },
    });

    assert.equal(manifest.sessionId, session.sessionId);
    assert.equal(manifest.frameRate, session.frameRate);
    assert.equal(manifest.stepMs, session.stepMs);
    assert.deepEqual(manifest.frameTimes, session.frameTimes);
    assert.deepEqual(manifest.sampleTimes, session.sampleTimes);
    assert.equal(manifest.totalFrames, session.totalFrames);
    assert.equal(manifest.totalSamples, session.sampleTimes.length);
});

test('buildExportManifest carries default verification metadata and is immutable', () => {
    const session = createSession();
    const manifest = buildExportManifest({
        renderSession: session,
        exportTarget: { type: 'mp4' },
    });

    assert.equal(manifest.verification.algorithm, EXPORT_HASH_ALGORITHM);
    assert.equal(manifest.verification.canonicalVersion, EXPORT_CANONICAL_VERSION);
    assert.equal(manifest.verification.exportHash, null);
    assert.equal(Object.isFrozen(manifest), true);
});
