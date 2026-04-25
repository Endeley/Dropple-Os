import test from 'node:test';
import assert from 'node:assert/strict';

import {
    projectActiveSequenceView,
    projectSequenceInspectorView,
    projectSequenceTimelineTracks,
} from '@/runtime/projection/selectors/sequenceSelectors.js';
import { selectActiveSequenceView } from '@/runtime/projection/selectors/sequenceRuntimeSelectors.js';
import {
    createSequence,
    createSequenceClip,
    createSequenceTrack,
} from '../sequenceRegistry.js';

test('projectSequenceTimelineTracks maps sequence tracks into shared timeline lanes', () => {
    const sequence = createSequence({
        id: 'fight-sequence',
        frameRate: 24,
        tracks: {
            camera: createSequenceTrack({
                id: 'camera',
                type: 'camera',
                label: 'Camera Track',
                clips: {
                    camA: createSequenceClip({
                        id: 'camA',
                        label: 'Camera A',
                        start: 0,
                        end: 120,
                        cameraNodeRef: 'camera-a',
                    }),
                },
            }),
        },
    });

    const tracks = projectSequenceTimelineTracks(sequence);

    assert.equal(tracks.length, 1);
    assert.equal(tracks[0].kind, 'sequence-track');
    assert.equal(tracks[0].trackType, 'camera');
    assert.equal(tracks[0].keyframes[0].time, 0);
    assert.equal(tracks[0].clips[0].cameraNodeRef, 'camera-a');
});

test('projectActiveSequenceView resolves active camera from document.sequences', () => {
    const document = {
        sequences: {
            activeSequenceId: 'fight-sequence',
            sequences: {
                'fight-sequence': createSequence({
                    id: 'fight-sequence',
                    frameRate: 24,
                    tracks: {
                        camera: createSequenceTrack({
                            id: 'camera',
                            type: 'camera',
                            clips: {
                                camA: createSequenceClip({
                                    id: 'camA',
                                    start: 0,
                                    end: 120,
                                    cameraNodeRef: 'camera-a',
                                }),
                            },
                        }),
                    },
                }),
            },
        },
    };

    const view = projectActiveSequenceView(document, { frame: 32 });

    assert.equal(view.sequenceId, 'fight-sequence');
    assert.equal(view.activeCamera.cameraNodeRef, 'camera-a');
});

test('selectActiveSequenceView reads canonical runtime temporal context', () => {
    const state = {
        document: {
            sequences: {
                activeSequenceId: 'fight-sequence',
                sequences: {
                    'fight-sequence': createSequence({
                        id: 'fight-sequence',
                        frameRate: 24,
                        tracks: {},
                    }),
                },
            },
        },
        scene: {
            temporalContext: {
                sequenceId: 'fight-sequence',
                frame: 32,
                timeMs: 1333,
                activeClips: [],
                activeAudioClips: [
                    {
                        clip: {
                            id: 'clip-audio',
                            assetId: 'audio-a',
                        },
                        asset: {
                            id: 'audio-a',
                            type: 'audio',
                            url: '/audio-a.wav',
                        },
                    },
                ],
                activeVideoClips: [
                    {
                        clip: {
                            id: 'clip-video',
                            assetId: 'video-a',
                        },
                        asset: {
                            id: 'video-a',
                            type: 'video',
                            url: '/video-a.mp4',
                        },
                    },
                ],
                activeShot: {
                    shotId: 'shot-a',
                    sceneId: 'scene-1',
                    localTime: 333,
                },
                activeCamera: {
                    cameraNodeRef: 'camera-runtime',
                    clipId: 'clip-runtime',
                    trackId: 'track-runtime',
                },
            },
        },
        playback: {
            frame: 0,
        },
    };

    const view = selectActiveSequenceView(state);

    assert.equal(view.sequenceId, 'fight-sequence');
    assert.equal(view.frame, 32);
    assert.equal(view.timeMs, 1333);
    assert.equal(view.activeCamera.cameraNodeRef, 'camera-runtime');
    assert.equal(view.activeShot.shotId, 'shot-a');
    assert.equal(view.activeAudioClips[0].asset.url, '/audio-a.wav');
    assert.equal(view.activeVideoClips[0].asset.url, '/video-a.mp4');
});

test('projectSequenceInspectorView exposes canonical clip, asset, and temporal inspector data', () => {
    const sequence = createSequence({
        id: 'edit-sequence',
        label: 'Edit Sequence',
        frameRate: 24,
        duration: 240,
        tracks: {
            audio: createSequenceTrack({
                id: 'audio',
                type: 'audio',
                label: 'Dialogue',
                order: 1,
                clips: {
                    clipA: createSequenceClip({
                        id: 'clipA',
                        label: 'Line A',
                        start: 0,
                        end: 48,
                        assetId: 'audio-a',
                        assetType: 'audio',
                        trimStartMs: 120,
                        trimEndMs: 1800,
                        gainDb: -4,
                        fadeInMs: 100,
                        fadeOutMs: 120,
                    }),
                },
            }),
        },
    });

    const view = projectSequenceInspectorView({
        sequence,
        assets: {
            images: {},
            videos: {},
            audio: {
                'audio-a': {
                    id: 'audio-a',
                    type: 'audio',
                    url: '/audio-a.wav',
                    durationMs: 2400,
                    waveform: {
                        peaks: [0.1, 0.7, 0.3],
                        bucketMs: 40,
                    },
                },
            },
        },
        sequenceView: {
            activeAudioClips: [{ clip: { id: 'clipA' } }],
            activeVideoClips: [],
            activeCamera: null,
            activeShot: { shotId: 'shot-a' },
        },
        selectedTrackId: 'sequence:edit-sequence:audio',
        selectedClipId: 'clipA',
    });

    assert.equal(view.sequenceId, 'edit-sequence');
    assert.equal(view.selectedTrack.type, 'audio');
    assert.equal(view.selectedClip.binding.kind, 'asset');
    assert.equal(view.selectedClip.asset.url, '/audio-a.wav');
    assert.equal(view.selectedClip.asset.hasWaveform, true);
    assert.equal(view.selectedClip.gainDb, -4);
    assert.equal(view.selectedClip.isActive, true);
    assert.equal(view.activeAudioClipCount, 1);
});
