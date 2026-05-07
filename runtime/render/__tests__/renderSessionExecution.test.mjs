import test from 'node:test';
import assert from 'node:assert/strict';

import { buildEvaluationInputs } from '@/runtime/animation/buildEvaluationInputs.js';
import { buildRenderSession } from '../renderSession.js';
import {
    createRenderSessionExecution,
    resumeRenderSessionExecution,
    runRenderSessionExecution,
    stepRenderSessionExecution,
} from '../renderSessionExecution.js';

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

function createSessionBundle() {
    const snapshot = createTransitionRuntimeSnapshot();
    const inputs = buildEvaluationInputs(snapshot, {
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

    return {
        snapshot,
        renderInput: inputs.renderInput,
        session,
    };
}

test('render session execution state is deterministic at creation', () => {
    const { session, renderInput } = createSessionBundle();

    const left = createRenderSessionExecution({ session, renderInput });
    const right = createRenderSessionExecution({ session, renderInput });

    assert.deepEqual(left, right);
    assert.equal(left.executionId, `${session.sessionId}:execution`);
    assert.equal(left.frameCursor, 0);
    assert.equal(left.sampleCursor, 0);
    assert.equal(left.completedFrameCount, 0);
    assert.equal(left.status, 'ready');
});

test('full run equals resumed run from midpoint', () => {
    const { session, renderInput } = createSessionBundle();

    const fullRun = runRenderSessionExecution({ session, renderInput });

    let partial = createRenderSessionExecution({ session, renderInput });
    const midpoint = Math.floor(session.totalFrames / 2);
    for (let index = 0; index < midpoint; index += 1) {
        partial = stepRenderSessionExecution(partial);
    }

    const resumed = runRenderSessionExecution({
        session,
        renderInput,
        executionState: partial,
    });

    assert.deepEqual(resumed, fullRun);
});

test('resume normalizes deterministic progress state from completed frames', () => {
    const { session, renderInput } = createSessionBundle();

    let state = createRenderSessionExecution({ session, renderInput });
    state = stepRenderSessionExecution(state);
    state = stepRenderSessionExecution(state);

    const resumed = resumeRenderSessionExecution({
        session,
        renderInput,
        executionState: state,
    });

    assert.equal(resumed.frameCursor, 2);
    assert.equal(resumed.completedFrameCount, 2);
    assert.deepEqual(resumed.completedFrames, state.completedFrames);
    assert.equal(resumed.status, 'ready');
});

test('transition-boundary frames remain present after resume', () => {
    const { session, renderInput } = createSessionBundle();
    const boundaryTimes = new Set(session.sampleTimes);

    let partial = createRenderSessionExecution({ session, renderInput });
    for (let index = 0; index < 5; index += 1) {
        partial = stepRenderSessionExecution(partial);
    }

    const resumed = runRenderSessionExecution({
        session,
        renderInput,
        executionState: partial,
    });
    const completedBoundaryTimes = resumed.completedFrames
        .map((entry) => entry.timeMs)
        .filter((timeMs) => boundaryTimes.has(timeMs));

    assert.deepEqual(completedBoundaryTimes, session.sampleTimes);
    assert.equal(resumed.status, 'completed');
});
