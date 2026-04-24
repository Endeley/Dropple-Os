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

    // shape changed due to clone carrying transform slots
    assert.equal(result.id, sceneA.id);
    assert.equal(result.x, sceneA.x);
    assert.equal(result.opacity, sceneA.opacity);

    // still cloned, not same object
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

    assert.equal(result.id, sceneB.id);
    assert.equal(result.x, sceneB.x);
    assert.equal(result.opacity, sceneB.opacity);

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

    // target authority preserved during crossfade
    assert.equal(left.x, 100);

    // opacity still blends
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
