import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { replayEvents } from '@/runtime/dispatcher/replayEvents.js';

test('export target events write canonical delivery targets into document.exports', () => {
    const next = replayEvents({
        initialState: structuredClone(initialRuntimeState),
        events: [
            {
                type: EventTypes.EXPORT_TARGET_UPSERT,
                payload: {
                    target: {
                        type: 'mp4',
                        delivery: 'master',
                        width: 1920,
                        height: 1080,
                        frameRate: 24,
                        videoCodec: 'h264',
                        audioCodec: 'aac',
                    },
                },
            },
            {
                type: EventTypes.EXPORT_TARGET_UPSERT,
                payload: {
                    target: {
                        id: 'wav:podcast',
                        type: 'wav',
                        delivery: 'podcast',
                        sampleRate: 48000,
                        channels: 2,
                        includeVideo: false,
                    },
                },
            },
        ],
    });

    assert.deepEqual(next.document.exports.targets, [
        {
            id: 'mp4:master',
            type: 'mp4',
            format: 'mp4',
            presetId: null,
            label: null,
            delivery: 'master',
            width: 1920,
            height: 1080,
            frameRate: 24,
            bitRateKbps: null,
            sampleRate: null,
            channels: null,
            videoCodec: 'h264',
            audioCodec: 'aac',
            includeVideo: true,
            includeAudio: true,
            includeAlpha: false,
            proxy: null,
            options: {},
        },
        {
            id: 'wav:podcast',
            type: 'wav',
            format: 'wav',
            presetId: null,
            label: null,
            delivery: 'podcast',
            width: null,
            height: null,
            frameRate: null,
            bitRateKbps: null,
            sampleRate: 48000,
            channels: 2,
            videoCodec: null,
            audioCodec: null,
            includeVideo: false,
            includeAudio: true,
            includeAlpha: false,
            proxy: null,
            options: {},
        },
    ]);
});

test('export target delete removes canonical delivery targets deterministically', () => {
    const next = replayEvents({
        initialState: structuredClone(initialRuntimeState),
        events: [
            {
                type: EventTypes.EXPORT_TARGET_UPSERT,
                payload: {
                    target: {
                        id: 'mp4:master',
                        type: 'mp4',
                    },
                },
            },
            {
                type: EventTypes.EXPORT_TARGET_DELETE,
                payload: {
                    targetId: 'mp4:master',
                },
            },
        ],
    });

    assert.deepEqual(next.document.exports.targets, []);
});
