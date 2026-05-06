import test from 'node:test';
import assert from 'node:assert/strict';

import { buildEvaluationInputs } from '@/runtime/animation/buildEvaluationInputs.js';
import { buildRenderSchedule, evaluateRenderFrame, resolveRenderFrameRate, resolveRenderStepMs } from '../renderOrchestration.js';
import { evaluateTransitionFrame } from '@/runtime/transition/evaluateTransitionFrame.js';

function createTransitionRuntimeSnapshot() {
    return {
        document: {
            sceneGraph: {
                activeSceneId: 'scene-1',
                rootIds: ['fallback-root', 'comp-a', 'comp-b'],
                nodes: {
                    'fallback-root': { id: 'fallback-root', type: 'frame', children: [] },
                    'comp-a': {
                        id: 'comp-a',
                        type: 'frame',
                        children: [],
                    },
                    'comp-b': {
                        id: 'comp-b',
                        type: 'frame',
                        children: [],
                    },
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

test('buildRenderSchedule derives deterministic frame stepping and transition boundaries from render input', () => {
    const inputs = buildEvaluationInputs(createTransitionRuntimeSnapshot(), {
        timeMs: 900,
        strictSceneScope: true,
    });

    const schedule = buildRenderSchedule({
        renderInput: inputs.renderInput,
        fromMs: 0,
        toMs: 1000,
        sampleCount: 4,
        includeTransitionBoundaries: true,
    });

    assert.equal(resolveRenderFrameRate(inputs.renderInput), 24);
    assert.equal(resolveRenderStepMs(inputs.renderInput), 41.667);
    assert.equal(schedule.frameRate, 24);
    assert.equal(schedule.stepMs, 41.667);
    assert.deepEqual(schedule.sampleTimes, [0, 333.336, 666.672, 800, 1000]);
});

test('evaluateRenderFrame matches canonical transition evaluation without committing runtime state', () => {
    const inputs = buildEvaluationInputs(createTransitionRuntimeSnapshot(), {
        timeMs: 900,
        strictSceneScope: true,
    });

    const orchestrated = evaluateRenderFrame({
        renderInput: {
            ...inputs.renderInput,
            timeMs: 900,
        },
        timeMs: 900,
        reason: 'orchestration-test',
        commit: false,
    });
    const direct = evaluateTransitionFrame({
        renderInput: {
            ...inputs.renderInput,
            timeMs: 900,
        },
        timeMs: 900,
    });

    assert.deepEqual(orchestrated.evaluatedScene, direct.evaluatedScene);
    assert.equal(orchestrated.shotId, direct.shotId);
    assert.equal(orchestrated.shotTimeMs, direct.shotTimeMs);
    assert.equal(orchestrated.transitionWindow?.t, direct.transitionWindow?.t);
    assert.equal(orchestrated.evalStatus, 'OK');
});
