import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { replayEvents } from '@/runtime/dispatcher/replayEvents.js';

test('media asset events write canonical asset truth into document.assets', () => {
    const next = replayEvents({
        initialState: structuredClone(initialRuntimeState),
        events: [
            {
                type: EventTypes.MEDIA_ASSET_REGISTER,
                payload: {
                    assetType: 'video',
                    asset: {
                        id: 'clip-video-a',
                        url: '/assets/video-a.mp4',
                        durationMs: 12000,
                        frameRate: 24,
                        proxy: {
                            id: 'clip-video-a-proxy',
                            url: '/assets/video-a.proxy.mp4',
                        },
                    },
                },
            },
            {
                type: EventTypes.MEDIA_ASSET_UPDATE,
                payload: {
                    assetType: 'video',
                    assetId: 'clip-video-a',
                    patch: {
                        trimStartMs: 250,
                        trimEndMs: 8000,
                    },
                },
            },
            {
                type: EventTypes.MEDIA_ASSET_REGISTER,
                payload: {
                    assetType: 'audio',
                    asset: {
                        id: 'clip-audio-a',
                        url: '/assets/audio-a.wav',
                        durationMs: 9000,
                        channels: 2,
                        sampleRate: 48000,
                        waveform: {
                            peaks: [0.2, 0.7, 0.4],
                            bucketMs: 30,
                        },
                    },
                },
            },
        ],
    });

    assert.deepEqual(next.document.assets.videos['clip-video-a'], {
        id: 'clip-video-a',
        type: 'video',
        url: '/assets/video-a.mp4',
        durationMs: 12000,
        trimStartMs: 250,
        trimEndMs: 8000,
        mimeType: null,
        width: null,
        height: null,
        channels: null,
        sampleRate: null,
        frameRate: 24,
        proxyId: null,
        proxy: {
            id: 'clip-video-a-proxy',
            url: '/assets/video-a.proxy.mp4',
            mimeType: null,
            width: null,
            height: null,
            bitRateKbps: null,
        },
        waveform: null,
        meta: {},
    });
    assert.equal(next.document.assets.audio['clip-audio-a'].channels, 2);
    assert.equal(next.document.assets.audio['clip-audio-a'].sampleRate, 48000);
    assert.equal(next.document.assets.audio['clip-audio-a'].waveform?.sampleCount, 3);
});
