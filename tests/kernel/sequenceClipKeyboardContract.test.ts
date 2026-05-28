import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveSequenceClipKeyboardIntent } from '@/ui/workspace/media/inspector/sequenceClipKeyboard.js';

function keyboardEventStub({
    key = 'ArrowRight',
    shiftKey = false,
    altKey = false,
    ctrlKey = false,
    metaKey = false,
    repeat = false,
    target = null,
} = {}) {
    return {
        key,
        shiftKey,
        altKey,
        ctrlKey,
        metaKey,
        repeat,
        target,
    };
}

test('sequence clip keyboard intent resolves deterministic move and trim semantics', () => {
    const selectedClip = { start: 20, end: 32 };

    const moveBase = resolveSequenceClipKeyboardIntent({
        event: keyboardEventStub({ key: 'ArrowRight' }),
        selectedClip,
    });
    assert.deepEqual(moveBase, { kind: 'move', patch: { start: 21, end: 33 } });

    const moveShift = resolveSequenceClipKeyboardIntent({
        event: keyboardEventStub({ key: 'ArrowLeft', shiftKey: true }),
        selectedClip,
    });
    assert.deepEqual(moveShift, { kind: 'move', patch: { start: 10, end: 22 } });

    const trimEnd = resolveSequenceClipKeyboardIntent({
        event: keyboardEventStub({ key: 'ArrowRight', altKey: true, shiftKey: true }),
        selectedClip,
    });
    assert.deepEqual(trimEnd, { kind: 'trim', patch: { end: 42 } });

    const trimStart = resolveSequenceClipKeyboardIntent({
        event: keyboardEventStub({ key: 'ArrowLeft', ctrlKey: true }),
        selectedClip,
    });
    assert.deepEqual(trimStart, { kind: 'trim', patch: { start: 19 } });
});

test('sequence clip keyboard intent is inert on text-edit focus and repeat events', () => {
    const selectedClip = { start: 4, end: 8 };

    const textTarget = { tagName: 'INPUT' };
    const fromInput = resolveSequenceClipKeyboardIntent({
        event: keyboardEventStub({ key: 'ArrowRight', target: textTarget }),
        selectedClip,
    });
    assert.equal(fromInput, null);

    const repeatEvent = resolveSequenceClipKeyboardIntent({
        event: keyboardEventStub({ key: 'ArrowRight', repeat: true }),
        selectedClip,
    });
    assert.equal(repeatEvent, null);
});
