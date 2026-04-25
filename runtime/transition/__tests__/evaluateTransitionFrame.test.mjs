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

function createSharedMotionSceneGraph() {
    return {
        rootIds: ['stage'],
        nodes: {
            stage: {
                id: 'stage',
                type: 'frame',
                children: ['hero', 'sidebar'],
                channels: {
                    'transform.x': 0,
                    'transform.y': 0,
                    opacity: 1,
                },
            },
            hero: {
                id: 'hero',
                type: 'frame',
                children: [],
                channels: {
                    'transform.x': 12,
                    'transform.y': 0,
                    opacity: 1,
                },
            },
            sidebar: {
                id: 'sidebar',
                type: 'frame',
                children: [],
                channels: {
                    'transform.x': 64,
                    'transform.y': 0,
                    opacity: 1,
                },
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
                        compositionId: 'stage',
                        transitionOut: {
                            type: 'crossfade',
                            durationMs: 200,
                        },
                    },
                    {
                        id: 'shotB',
                        start: 1000,
                        duration: 1000,
                        compositionId: 'stage',
                    },
                ],
            },
        ],
    };
}

function createSharedMotionShotTimeline() {
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
                timeline: {
                    duration: 1000,
                    tracks: [{ id: 't1', type: 'standard', order: 0, channelIds: ['transform.y'] }],
                    channels: [
                        {
                            id: 'transform.y',
                            target: 'hero',
                            property: 'translateY',
                            keyframes: [{ time: 0, value: 0 }],
                        },
                    ],
                },
            },
            {
                id: 'shotB',
                startMs: 1000,
                endMs: 2000,
                transitionOut: null,
                timeline: {
                    duration: 1000,
                    tracks: [{ id: 't1', type: 'standard', order: 0, channelIds: ['transform.y'] }],
                    channels: [
                        {
                            id: 'transform.y',
                            target: 'hero',
                            property: 'translateY',
                            keyframes: [{ time: 0, value: 20 }],
                        },
                    ],
                },
            },
        ],
    };
}

function createDistinctMotionSceneGraph() {
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
                children: [],
                channels: {
                    'transform.x': 0,
                    'transform.y': 6,
                    opacity: 1,
                },
            },
            compB: {
                id: 'compB',
                type: 'frame',
                children: [],
                channels: {
                    'transform.x': 100,
                    'transform.y': 18,
                    opacity: 1,
                },
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

test('crossfade interpolates targeted transform motion for shared nodes while preserving untouched siblings', () => {
    const result = evaluateTransitionFrame({
        shotTimeline: createSharedMotionShotTimeline(),
        sceneGraph: createSharedMotionSceneGraph(),
        activeSceneId: 'sceneA',
        activeShotId: 'shotA',
        timeMs: 900,
        strictSceneScope: true,
    });

    assert.equal(result.transitionWindow.t, 0.5);

    const stage = result.evaluatedScene;
    const hero = stage?.children.find((node) => node.id === 'hero');
    const sidebar = stage?.children.find((node) => node.id === 'sidebar');

    assert.ok(stage);
    assert.ok(hero);
    assert.ok(sidebar);
    assert.equal(hero.worldTransform.x, 12);
    assert.equal(hero.worldTransform.y, 10);
    assert.equal(sidebar.worldTransform.x, 64);
    assert.equal(sidebar.worldTransform.y, 0);
});

test('crossfade keeps distinct shot roots independent instead of morphing transform authority across compositions', () => {
    const result = evaluateTransitionFrame({
        shotTimeline: createShotTimeline(),
        sceneGraph: createDistinctMotionSceneGraph(),
        activeSceneId: 'sceneA',
        activeShotId: 'shotA',
        timeMs: 900,
        strictSceneScope: true,
    });

    const compA = result.evaluatedScene.children.find((node) => node.id === 'compA');
    const compB = result.evaluatedScene.children.find((node) => node.id === 'compB');

    assert.ok(compA);
    assert.ok(compB);
    assert.equal(compA.worldTransform.y, 6);
    assert.equal(compB.worldTransform.y, 18);
    assert.equal(compA.opacity, 0.5);
    assert.equal(compB.opacity, 0.5);
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
