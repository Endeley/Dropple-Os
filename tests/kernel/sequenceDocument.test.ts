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

test('sequence events write truth into document.sequences through the canonical replay path', async () => {
    const sequence = createSequence({
        id: 'fight-sequence',
        label: 'Fight Intro',
        duration: 240,
        frameRate: 24,
    });
    const track = createSequenceTrack({
        id: 'camera-track',
        type: 'camera',
        label: 'Camera Track',
        order: 0,
    });
    const clip = createSequenceClip({
        id: 'cam-a',
        label: 'Camera A',
        start: 0,
        end: 120,
        cameraNodeRef: 'camera-a',
    });

    const next = replayEvents({
        initialState: structuredClone(initialRuntimeState),
        events: [
            {
                type: EventTypes.SEQUENCE_CREATE,
                payload: { sequence },
            },
            {
                type: EventTypes.SEQUENCE_TRACK_CREATE,
                payload: {
                    sequenceId: 'fight-sequence',
                    track,
                },
            },
            {
                type: EventTypes.SEQUENCE_CLIP_CREATE,
                payload: {
                    sequenceId: 'fight-sequence',
                    trackId: 'camera-track',
                    clip,
                },
            },
            {
                type: EventTypes.SEQUENCE_SET_ACTIVE,
                payload: {
                    sequenceId: 'fight-sequence',
                },
            },
        ],
    });

    assert.equal(next.document.sequences.activeSequenceId, 'fight-sequence');
    assert.deepEqual(next.document.sequences.sequences['fight-sequence'].tracks['camera-track'], {
        ...track,
        clips: {
            'cam-a': clip,
        },
    });
});
