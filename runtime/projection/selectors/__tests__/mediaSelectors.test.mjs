import test from 'node:test';
import assert from 'node:assert/strict';

import {
    projectMediaAssetSummary,
    projectMediaAssets,
    projectMediaExportTargets,
} from '../mediaSelectors.js';

test('projectMediaAssetSummary exposes proxy and waveform-ready media metadata deterministically', () => {
    const summary = projectMediaAssetSummary(
        {
            id: 'audio-a',
            type: 'audio',
            url: '/audio-a.wav',
            durationMs: 2000,
            trimStartMs: 100,
            trimEndMs: 1900,
            sampleRate: 48000,
            channels: 2,
            proxyId: 'audio-a-proxy',
            proxy: {
                id: 'audio-a-proxy',
                url: '/audio-a.proxy.wav',
            },
            waveform: {
                peaks: [0.1, 0.5, 0.2],
                bucketMs: 50,
            },
        },
        'audio-a',
        'audio',
    );

    assert.equal(summary.id, 'audio-a');
    assert.equal(summary.hasProxy, true);
    assert.equal(summary.hasWaveform, true);
    assert.equal(summary.effectiveDurationMs, 1800);
    assert.equal(summary.waveform.sampleCount, 3);
});

test('projectMediaAssets returns stable summarized media entries across asset buckets', () => {
    const entries = projectMediaAssets({
        images: {
            hero: { id: 'hero', type: 'image', url: '/hero.png' },
        },
        videos: {
            promo: { id: 'promo', type: 'video', url: '/promo.mp4', frameRate: 24 },
        },
        audio: {
            voice: { id: 'voice', type: 'audio', url: '/voice.wav' },
        },
    });

    assert.deepEqual(
        entries.map((entry) => `${entry.type}:${entry.id}`),
        ['audio:voice', 'image:hero', 'video:promo'],
    );
    assert.equal(entries[2].frameRate, 24);
});

test('projectMediaExportTargets exposes normalized delivery preset summaries deterministically', () => {
    const targets = projectMediaExportTargets({
        targets: [
            {
                id: 'mp4:master',
                type: 'mp4',
                format: 'mp4',
                delivery: 'master',
                width: 1920,
                height: 1080,
                frameRate: 24,
                includeAudio: true,
                includeVideo: true,
            },
            {
                id: 'wav:podcast',
                type: 'wav',
                format: 'wav',
                delivery: 'podcast',
                sampleRate: 48000,
                channels: 2,
                includeAudio: true,
                includeVideo: false,
            },
        ],
    });

    assert.deepEqual(
        targets.map((target) => target.id),
        ['mp4:master', 'wav:podcast'],
    );
    assert.equal(targets[0].width, 1920);
    assert.equal(targets[1].includeVideo, false);
});
