import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { replayEvents } from '@/runtime/dispatcher/replayEvents.js';
import {
    createSequence,
    createSequenceClip,
    createSequenceTrack,
} from '@/runtime/sequencer/sequenceRegistry.js';

test('sequence clip move, trim, and split preserve canonical order and media fields', () => {
    const next = replayEvents({
        initialState: structuredClone(initialRuntimeState),
        events: [
            {
                type: EventTypes.SEQUENCE_CREATE,
                payload: {
                    sequence: createSequence({ id: 'edit-seq', duration: 240, frameRate: 24 }),
                },
            },
            {
                type: EventTypes.SEQUENCE_TRACK_CREATE,
                payload: {
                    sequenceId: 'edit-seq',
                    track: createSequenceTrack({ id: 'video-track', type: 'video', order: 0 }),
                },
            },
            {
                type: EventTypes.SEQUENCE_CLIP_CREATE,
                payload: {
                    sequenceId: 'edit-seq',
                    trackId: 'video-track',
                    clip: createSequenceClip({
                        id: 'clip-a',
                        start: 0,
                        end: 48,
                        assetId: 'video-a',
                        assetType: 'video',
                        trimEndMs: 2000,
                    }),
                },
            },
            {
                type: EventTypes.SEQUENCE_CLIP_MOVE,
                payload: {
                    sequenceId: 'edit-seq',
                    trackId: 'video-track',
                    clipId: 'clip-a',
                    start: 24,
                    end: 72,
                },
            },
            {
                type: EventTypes.SEQUENCE_CLIP_TRIM,
                payload: {
                    sequenceId: 'edit-seq',
                    trackId: 'video-track',
                    clipId: 'clip-a',
                    start: 24,
                    end: 60,
                },
            },
            {
                type: EventTypes.SEQUENCE_CLIP_SPLIT,
                payload: {
                    sequenceId: 'edit-seq',
                    trackId: 'video-track',
                    clipId: 'clip-a',
                    splitAt: 42,
                    rightClipId: 'clip-b',
                },
            },
        ],
    });

    const clips = next.document.sequences.sequences['edit-seq'].tracks['video-track'].clips;
    assert.deepEqual(Object.keys(clips), ['clip-a', 'clip-b']);
    assert.equal(clips['clip-a'].start, 24);
    assert.equal(clips['clip-a'].end, 42);
    assert.equal(clips['clip-a'].assetId, 'video-a');
    assert.equal(clips['clip-b'].start, 42);
    assert.equal(clips['clip-b'].end, 60);
    assert.equal(clips['clip-b'].assetType, 'video');
});

test('sequence clip creation rejects overlapping clips on canonical non-overlap tracks', () => {
    assert.throws(
        () =>
            replayEvents({
                initialState: structuredClone(initialRuntimeState),
                events: [
                    {
                        type: EventTypes.SEQUENCE_CREATE,
                        payload: {
                            sequence: createSequence({ id: 'edit-seq', duration: 240, frameRate: 24 }),
                        },
                    },
                    {
                        type: EventTypes.SEQUENCE_TRACK_CREATE,
                        payload: {
                            sequenceId: 'edit-seq',
                            track: createSequenceTrack({ id: 'video-track', type: 'video', order: 0 }),
                        },
                    },
                    {
                        type: EventTypes.SEQUENCE_CLIP_CREATE,
                        payload: {
                            sequenceId: 'edit-seq',
                            trackId: 'video-track',
                            clip: createSequenceClip({ id: 'clip-a', start: 0, end: 48 }),
                        },
                    },
                    {
                        type: EventTypes.SEQUENCE_CLIP_CREATE,
                        payload: {
                            sequenceId: 'edit-seq',
                            trackId: 'video-track',
                            clip: createSequenceClip({ id: 'clip-b', start: 24, end: 72 }),
                        },
                    },
                ],
            }),
        /sequence: clips must not overlap/,
    );
});

test('sequence clip move can rehome a clip across canonical tracks without overlap drift', () => {
    const next = replayEvents({
        initialState: structuredClone(initialRuntimeState),
        events: [
            {
                type: EventTypes.SEQUENCE_CREATE,
                payload: {
                    sequence: createSequence({ id: 'edit-seq', duration: 240, frameRate: 24 }),
                },
            },
            {
                type: EventTypes.SEQUENCE_TRACK_CREATE,
                payload: {
                    sequenceId: 'edit-seq',
                    track: createSequenceTrack({ id: 'video-track-a', type: 'video', order: 0 }),
                },
            },
            {
                type: EventTypes.SEQUENCE_TRACK_CREATE,
                payload: {
                    sequenceId: 'edit-seq',
                    track: createSequenceTrack({ id: 'video-track-b', type: 'video', order: 1 }),
                },
            },
            {
                type: EventTypes.SEQUENCE_CLIP_CREATE,
                payload: {
                    sequenceId: 'edit-seq',
                    trackId: 'video-track-a',
                    clip: createSequenceClip({
                        id: 'clip-a',
                        start: 0,
                        end: 48,
                        assetId: 'video-a',
                        assetType: 'video',
                    }),
                },
            },
            {
                type: EventTypes.SEQUENCE_CLIP_MOVE,
                payload: {
                    sequenceId: 'edit-seq',
                    trackId: 'video-track-a',
                    toTrackId: 'video-track-b',
                    clipId: 'clip-a',
                    start: 72,
                    end: 120,
                },
            },
        ],
    });

    const sequence = next.document.sequences.sequences['edit-seq'];
    assert.deepEqual(Object.keys(sequence.tracks['video-track-a'].clips), []);
    assert.deepEqual(Object.keys(sequence.tracks['video-track-b'].clips), ['clip-a']);
    assert.equal(sequence.tracks['video-track-b'].clips['clip-a'].start, 72);
    assert.equal(sequence.tracks['video-track-b'].clips['clip-a'].end, 120);
    assert.equal(sequence.tracks['video-track-b'].clips['clip-a'].assetId, 'video-a');
});
