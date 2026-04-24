import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateTransitionFrame } from '../evaluateTransitionFrame.js';

function createSceneGraph() {
    return {
        rootIds: ['fallback-root'],
        nodes: {
            'fallback-root': {
                id: 'fallback-root',
                type: 'frame',
                children: [],
            },

            compA: {
                id: 'compA',
                type: 'frame',
                x: 0,
                opacity: 1,
                children: [],
            },

            compB: {
                id: 'compB',
                type: 'frame',
                x: 100,
                opacity: 0.2,
                children: [],
            },
        },

        scenes: [
            {
                id: 'sceneA',
                shots: [
                    {
                        id: 'shotA',
                        start: 0,
                        duration: 1000,
                        compositionId: 'compA',
                        transitionOut: {
                            type: 'crossfade',
                            durationMs: 200,
                        },
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
    };
}

function createShotTimeline() {
    return {
        shots: [
            {
                id: 'shotA',
                startMs: 0,
                endMs: 1000,
                transitionOut: {
                    type: 'crossfade',
                    durationMs: 200,
                },
            },

            {
                id: 'shotB',
                startMs: 1000,
                endMs: 2000,
                transitionOut: null,
            },
        ],
    };
}

test('evaluateTransitionFrame scopes both shots independently during crossfade', () => {
    const result = evaluateTransitionFrame({
        shotTimeline: createShotTimeline(),
        sceneGraph: createSceneGraph(),
        activeSceneId: 'sceneA',
        activeShotId: 'shotA',
        timeMs: 900,
        strictSceneScope: true,
    });

    assert.equal(result.shotId, 'shotA');

    assert.equal(result.transitionWindow.toShotId, 'shotB');

    assert.deepEqual(
        result.evaluatedScene.children.map((c) => c.id),
        ['compA', 'compB'],
    );

    assert.equal(result.evaluatedScene.children[0].opacity, 0.5);

    assert.equal(result.evaluatedScene.children[1].opacity, 0.5);
});

test('crossfade preserves target authority and does not morph unrelated nodes', () => {
    const result = evaluateTransitionFrame({
        shotTimeline: createShotTimeline(),
        sceneGraph: createSceneGraph(),
        activeSceneId: 'sceneA',
        activeShotId: 'shotA',
        timeMs: 900,
        strictSceneScope: true,
    });

    const a = result.evaluatedScene.children[0];
    const b = result.evaluatedScene.children[1];

    assert.equal(a.worldTransform.x, 0);

    assert.equal(b.worldTransform.x, 0);

    assert.equal(a.opacity, 0.5);

    assert.equal(b.opacity, 0.5);
});

test('targeted transform transition does not leak across sibling authority', () => {
    const result = evaluateTransitionFrame({
        shotTimeline: createShotTimeline(),
        sceneGraph: createSceneGraph(),
        activeSceneId: 'sceneA',
        activeShotId: 'shotA',
        timeMs: 900,
    });

    assert.deepEqual(
        result.evaluatedScene.children.map((n) => n.id),
        ['compA', 'compB'],
    );
});

test('transition evaluation is deterministic across repeated runs', () => {
    const a = evaluateTransitionFrame({
        shotTimeline: createShotTimeline(),
        sceneGraph: createSceneGraph(),
        activeSceneId: 'sceneA',
        activeShotId: 'shotA',
        timeMs: 900,
    });

    const b = evaluateTransitionFrame({
        shotTimeline: createShotTimeline(),
        sceneGraph: createSceneGraph(),
        activeSceneId: 'sceneA',
        activeShotId: 'shotA',
        timeMs: 900,
    });

    assert.deepEqual(a.evaluatedScene, b.evaluatedScene);
});
