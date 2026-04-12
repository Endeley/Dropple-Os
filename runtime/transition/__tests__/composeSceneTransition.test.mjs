import test from 'node:test';
import assert from 'node:assert/strict';

import { composeSceneTransition } from '../composeSceneTransition.js';

function createScene(id, x, opacity = 1) {
    return {
        id,
        x,
        y: 0,
        opacity,
        rotation: 0,
        scale: 1,
        children: [],
    };
}

test('cut returns sceneA before completion', () => {
    const sceneA = createScene('a', 0);
    const sceneB = createScene('b', 100);

    const result = composeSceneTransition({
        sceneA,
        sceneB,
        transition: { type: 'cut', durationMs: 100 },
        t: 0.5,
    });

    assert.deepEqual(result, sceneA);
    assert.notEqual(result, sceneA);
});

test('cut returns sceneB at completion', () => {
    const sceneA = createScene('a', 0);
    const sceneB = createScene('b', 100);

    const result = composeSceneTransition({
        sceneA,
        sceneB,
        transition: { type: 'cut', durationMs: 100 },
        t: 1,
    });

    assert.deepEqual(result, sceneB);
    assert.notEqual(result, sceneB);
});

test('crossfade blends deterministically at midpoint', () => {
    const sceneA = createScene('shared', 0, 1);
    const sceneB = createScene('shared', 100, 0.2);

    const left = composeSceneTransition({
        sceneA,
        sceneB,
        transition: { type: 'crossfade', durationMs: 100 },
        t: 0.5,
    });
    const right = composeSceneTransition({
        sceneA,
        sceneB,
        transition: { type: 'crossfade', durationMs: 100 },
        t: 0.5,
    });

    assert.deepEqual(left, right);
    assert.equal(left.x, 50);
    assert.equal(left.opacity, 0.6);
});

test('does not mutate inputs', () => {
    const sceneA = createScene('a', 0);
    const sceneB = createScene('a', 100);
    const beforeA = structuredClone(sceneA);
    const beforeB = structuredClone(sceneB);

    composeSceneTransition({
        sceneA,
        sceneB,
        transition: { type: 'crossfade', durationMs: 100 },
        t: 0.25,
    });

    assert.deepEqual(sceneA, beforeA);
    assert.deepEqual(sceneB, beforeB);
});
