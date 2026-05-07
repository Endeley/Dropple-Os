import test from 'node:test';
import assert from 'node:assert/strict';

import { buildEvaluationInputs } from '@/runtime/animation/buildEvaluationInputs.js';
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

test('buildRenderSession is deterministic for the same input, range, and policy', () => {
    const inputs = buildEvaluationInputs(createTransitionRuntimeSnapshot(), {
        timeMs: 900,
        strictSceneScope: true,
    });

    const left = buildRenderSession({
        renderInput: inputs.renderInput,
        fromMs: 0,
        toMs: 1000,
        framePolicy: { mode: 'sequence-frame-rate' },
        samplePolicy: { mode: 'stability-preflight', sampleCount: 4, includeTransitionBoundaries: true },
    });
    const right = buildRenderSession({
        renderInput: inputs.renderInput,
        fromMs: 0,
        toMs: 1000,
        framePolicy: { mode: 'sequence-frame-rate' },
        samplePolicy: { mode: 'stability-preflight', sampleCount: 4, includeTransitionBoundaries: true },
    });

    assert.equal(left.sessionId, right.sessionId);
    assert.deepEqual(left, right);
});

test('buildRenderSession preserves canonical transition boundaries in sampleTimes', () => {
    const inputs = buildEvaluationInputs(createTransitionRuntimeSnapshot(), {
        timeMs: 900,
        strictSceneScope: true,
    });
    const session = buildRenderSession({
        renderInput: inputs.renderInput,
        fromMs: 0,
        toMs: 1000,
        samplePolicy: { mode: 'stability-preflight', sampleCount: 4, includeTransitionBoundaries: true },
    });

    assert.deepEqual(session.sampleTimes, [0, 333.336, 666.672, 800, 1000]);
    assert.equal(session.totalFrames, session.frameTimes.length);
});

test('playback and export sessions agree on stepping for the same render input', () => {
    const inputs = buildEvaluationInputs(createTransitionRuntimeSnapshot(), {
        timeMs: 900,
        strictSceneScope: true,
    });

    const playbackSession = buildRenderSession({
        renderInput: inputs.renderInput,
        fromMs: 0,
        toMs: 1000,
        framePolicy: { mode: 'sequence-frame-rate' },
        samplePolicy: { mode: 'playback-cadence', sampleCount: 4, includeTransitionBoundaries: true },
    });
    const exportSession = buildRenderSession({
        renderInput: inputs.renderInput,
        fromMs: 0,
        toMs: 1000,
        framePolicy: { mode: 'sequence-frame-rate' },
        samplePolicy: { mode: 'stability-preflight', sampleCount: 4, includeTransitionBoundaries: true },
    });

    assert.equal(playbackSession.frameRate, exportSession.frameRate);
    assert.equal(playbackSession.stepMs, exportSession.stepMs);
    assert.deepEqual(playbackSession.frameTimes, exportSession.frameTimes);
});
