import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createSequence,
    createSequenceClip,
    createSequenceTrack,
} from '../sequenceRegistry.js';
import { evaluateSequence } from '../evaluation/evaluateSequence.js';

test('evaluateSequence resolves active clips and active camera deterministically', () => {
    const sequence = createSequence({
        id: 'fight-sequence',
        duration: 240,
        frameRate: 24,
        tracks: {
            camera: createSequenceTrack({
                id: 'camera',
                type: 'camera',
                order: 0,
                clips: {
                    camA: createSequenceClip({
                        id: 'camA',
                        start: 0,
                        end: 120,
                        cameraNodeRef: 'camera-a',
                    }),
                },
            }),
            animation: createSequenceTrack({
                id: 'animation',
                type: 'animation',
                order: 1,
                clips: {
                    punch: createSequenceClip({
                        id: 'punch',
                        start: 60,
                        end: 180,
                        animationRef: 'hero-punch',
                    }),
                },
            }),
        },
    });

    const result = evaluateSequence({
        sequence,
        frame: 90,
    });

    assert.equal(result.sequenceId, 'fight-sequence');
    assert.equal(result.activeClips.length, 2);
    assert.equal(result.activeCamera.cameraNodeRef, 'camera-a');
    assert.equal(result.activeCamera.trackId, 'camera');
});

test('evaluateSequence resolves active media assets and active audio clips deterministically', () => {
    const sequence = createSequence({
        id: 'media-sequence',
        duration: 240,
        frameRate: 24,
        tracks: {
            video: createSequenceTrack({
                id: 'video',
                type: 'video',
                order: 0,
                clips: {
                    clipA: createSequenceClip({
                        id: 'clipA',
                        start: 0,
                        end: 120,
                        assetId: 'video-a',
                        assetType: 'video',
                    }),
                },
            }),
            audio: createSequenceTrack({
                id: 'audio',
                type: 'audio',
                order: 1,
                clips: {
                    clipB: createSequenceClip({
                        id: 'clipB',
                        start: 0,
                        end: 120,
                        assetId: 'audio-a',
                        assetType: 'audio',
                        gainDb: -3,
                    }),
                },
            }),
        },
    });

    const result = evaluateSequence({
        sequence,
        assets: {
            images: {},
            videos: {
                'video-a': { id: 'video-a', type: 'video', url: '/video-a.mp4' },
            },
            audio: {
                'audio-a': { id: 'audio-a', type: 'audio', url: '/audio-a.wav' },
            },
        },
        frame: 60,
    });

    assert.equal(result.activeClips.length, 2);
    assert.equal(result.activeVideoClips.length, 1);
    assert.equal(result.activeAudioClips.length, 1);
    assert.equal(result.activeVideoClips[0].asset.url, '/video-a.mp4');
    assert.equal(result.activeAudioClips[0].asset.url, '/audio-a.wav');
    assert.equal(result.activeAudioClips[0].clip.gainDb, -3);
});
