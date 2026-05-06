import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveSceneTransitionWindow } from '../resolveSceneTransitionWindow.js';

test('returns null when no transition is present', () => {
    const result = resolveSceneTransitionWindow({
        shots: [{ id: 'a', startMs: 0, endMs: 1000 }],
        timeMs: 500,
    });

    assert.equal(result, null);
});

test('resolves an active crossfade window deterministically', () => {
    const shots = [
        {
            id: 'a',
            startMs: 0,
            endMs: 1000,
            transitionOut: { type: 'crossfade', durationMs: 200 },
        },
        { id: 'b', startMs: 1000, endMs: 2000 },
    ];

    const left = resolveSceneTransitionWindow({ shots, timeMs: 900 });
    const right = resolveSceneTransitionWindow({ shots, timeMs: 900 });

    assert.deepEqual(left, right);
    assert.equal(left.fromShotId, 'a');
    assert.equal(left.toShotId, 'b');
    assert.equal(left.t, 0.5);
});

test('handles zero-duration cut at boundary deterministically', () => {
    const shots = [
        {
            id: 'a',
            startMs: 0,
            endMs: 1000,
            transitionOut: { type: 'cut', durationMs: 0 },
        },
        { id: 'b', startMs: 1000, endMs: 2000 },
    ];

    assert.equal(resolveSceneTransitionWindow({ shots, timeMs: 999 }), null);

    const result = resolveSceneTransitionWindow({ shots, timeMs: 1000 });
    assert.equal(result.fromShotId, 'a');
    assert.equal(result.toShotId, 'b');
    assert.equal(result.t, 1);
});

test('rejects overlapping shot windows before transition resolution', () => {
    assert.throws(
        () =>
            resolveSceneTransitionWindow({
                shots: [
                    {
                        id: 'a',
                        startMs: 0,
                        endMs: 1000,
                        transitionOut: { type: 'crossfade', durationMs: 200 },
                    },
                    {
                        id: 'b',
                        startMs: 900,
                        endMs: 1500,
                    },
                ],
                timeMs: 950,
            }),
        /sceneGraph: shots must not overlap \(transition-window:b\)/,
    );
});

test('rejects camera transition windows that extend outside the owning shot', () => {
    assert.throws(
        () =>
            resolveSceneTransitionWindow({
                shots: [
                    {
                        id: 'a',
                        startMs: 100,
                        endMs: 200,
                        transitionOut: { type: 'crossfade', durationMs: 150 },
                    },
                    {
                        id: 'b',
                        startMs: 200,
                        endMs: 400,
                    },
                ],
                timeMs: 180,
            }),
        /camera transition governance: transition window must remain within owning shot \(a\)/,
    );
});

test('rejects unsupported camera transition types', () => {
    assert.throws(
        () =>
            resolveSceneTransitionWindow({
                shots: [
                    {
                        id: 'a',
                        startMs: 0,
                        endMs: 1000,
                        transitionOut: { type: 'wipe', durationMs: 100 },
                    },
                    {
                        id: 'b',
                        startMs: 1000,
                        endMs: 2000,
                    },
                ],
                timeMs: 950,
            }),
        /camera transition governance: unsupported transition type wipe/,
    );
});

test('rejects last-shot outgoing camera transition ownership', () => {
    assert.throws(
        () =>
            resolveSceneTransitionWindow({
                shots: [
                    {
                        id: 'a',
                        startMs: 0,
                        endMs: 1000,
                        transitionOut: { type: 'crossfade', durationMs: 100 },
                    },
                ],
                timeMs: 950,
            }),
        /camera transition governance: last shot cannot own an outgoing transition \(a\)/,
    );
});

test('rejects non-contiguous adjacent transition targets', () => {
    assert.throws(
        () =>
            resolveSceneTransitionWindow({
                shots: [
                    {
                        id: 'a',
                        startMs: 0,
                        endMs: 1000,
                        transitionOut: { type: 'crossfade', durationMs: 100 },
                    },
                    {
                        id: 'b',
                        startMs: 1100,
                        endMs: 2000,
                    },
                ],
                timeMs: 950,
            }),
        /camera transition governance: transition target must be adjacent and contiguous \(a -> b\)/,
    );
});

test('rejects adjacent transition chaining with no stable ownership span', () => {
    assert.throws(
        () =>
            resolveSceneTransitionWindow({
                shots: [
                    {
                        id: 'a',
                        startMs: 0,
                        endMs: 1000,
                        transitionOut: { type: 'crossfade', durationMs: 200 },
                    },
                    {
                        id: 'b',
                        startMs: 1000,
                        endMs: 1100,
                        transitionOut: { type: 'crossfade', durationMs: 100 },
                    },
                    {
                        id: 'c',
                        startMs: 1100,
                        endMs: 2000,
                    },
                ],
                timeMs: 950,
            }),
        /camera transition governance: adjacent transition chaining is not allowed \(a -> b\)/,
    );
});
