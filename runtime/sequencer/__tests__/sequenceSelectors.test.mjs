import test from 'node:test';
import assert from 'node:assert/strict';

import {
    projectActiveSequenceView,
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
});
