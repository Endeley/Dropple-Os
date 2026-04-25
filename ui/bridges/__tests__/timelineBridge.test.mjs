import test from 'node:test';
import assert from 'node:assert/strict';

import { registerTimelineBridge } from '@/ui/bridges/timelineBridge.js';
import {
    timelineIntentSequenceClipMove,
    timelineIntentSequenceClipSplit,
    timelineIntentSequenceClipTrim,
} from '@/ui/timeline/timelineIntent.js';
import { EventTypes } from '@/core/events/eventTypes.js';

function createDispatcher(target) {
    return {
        dispatch(event) {
            target.push(event);
        },
    };
}

test('timeline bridge dispatches dedicated sequence clip move, trim, and split intents', () => {
    const dispatched = [];
    const cleanup = registerTimelineBridge(createDispatcher(dispatched));

    try {
        timelineIntentSequenceClipMove({
            sequenceId: 'seq-a',
            trackId: 'track-a',
            clipId: 'clip-a',
            start: 24,
            end: 72,
        });
        timelineIntentSequenceClipTrim({
            sequenceId: 'seq-a',
            trackId: 'track-a',
            clipId: 'clip-a',
            start: 30,
        });
        timelineIntentSequenceClipSplit({
            sequenceId: 'seq-a',
            trackId: 'track-a',
            clipId: 'clip-a',
            splitAt: 42,
            rightClipId: 'clip-b',
        });
    } finally {
        cleanup?.();
    }

    assert.equal(dispatched.length, 3);
    assert.equal(dispatched[0]?.type, EventTypes.SEQUENCE_CLIP_MOVE);
    assert.equal(dispatched[0]?.payload?.start, 24);
    assert.equal(dispatched[1]?.type, EventTypes.SEQUENCE_CLIP_TRIM);
    assert.equal(dispatched[1]?.payload?.start, 30);
    assert.equal(dispatched[2]?.type, EventTypes.SEQUENCE_CLIP_SPLIT);
    assert.equal(dispatched[2]?.payload?.rightClipId, 'clip-b');
});
