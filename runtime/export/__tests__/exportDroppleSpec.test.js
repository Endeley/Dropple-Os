import test from 'node:test';
import assert from 'node:assert/strict';

import { exportDroppleSpec } from '../exportDroppleSpec.js';
import { buildEvaluationInputs } from '@/runtime/animation/buildEvaluationInputs.js';
import { evaluateTransitionFrame } from '@/runtime/transition/evaluateTransitionFrame.js';

test('exportDroppleSpec blocks export when strict scene scope is invalid', () => {
    const workspace = {
        document: {
            sceneGraph: {
                rootIds: ['fallback-root'],
                nodes: {
                    'fallback-root': { id: 'fallback-root', type: 'frame', children: [] },
                },
                activeSceneId: 'sceneA',
                scenes: [
                    {
                        id: 'sceneA',
                        shots: [{ id: 'shotA', start: 0, duration: 1000, compositionId: 'missing-root' }],
                    },
                ],
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
    };

    assert.throws(
        () => exportDroppleSpec(workspace),
        /extractActiveSceneTree: no valid composition root \(sceneA\)/,
    );
});

test('export transition evaluation matches runtime transition composition at the same time sample', () => {
    const workspace = {
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

    const inputs = buildEvaluationInputs(workspace, { timeMs: 900, strictSceneScope: true });
    const previewLike = evaluateTransitionFrame({
        shotTimeline: inputs.shotTimeline,
        sceneGraph: workspace.document.sceneGraph,
        activeSceneId: inputs.activeSceneId,
        activeShotId: inputs.activeShotId,
        timeMs: 900,
        cameraTransform: inputs.cameraTransform,
        strictSceneScope: true,
    });
    const exportLike = evaluateTransitionFrame({
        shotTimeline: inputs.shotTimeline,
        sceneGraph: workspace.document.sceneGraph,
        activeSceneId: inputs.activeSceneId,
        activeShotId: inputs.activeShotId,
        timeMs: 900,
        cameraTransform: inputs.cameraTransform,
        strictSceneScope: true,
    });

    assert.deepEqual(exportLike.evaluatedScene, previewLike.evaluatedScene);
    assert.equal(exportLike.transitionWindow.transition.type, 'crossfade');
    assert.doesNotThrow(() => exportDroppleSpec(workspace));
});
