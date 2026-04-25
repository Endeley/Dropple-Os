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
