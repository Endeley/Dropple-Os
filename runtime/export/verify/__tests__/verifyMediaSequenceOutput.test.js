import test from 'node:test';
import assert from 'node:assert/strict';

import { exportDroppleSpec } from '../../exportDroppleSpec.js';
import { evaluateSequenceAtTime } from '@/runtime/sequencer/evaluation/evaluateSequenceAtTime.js';
import { verifyMediaSequenceOutput } from '../verifyMediaSequenceOutput.js';

test('verifyMediaSequenceOutput matches canonical exported media sequencing against runtime preview samples', () => {
    const document = {
        sceneGraph: {
            rootIds: ['root'],
            nodes: {
                root: { id: 'root', type: 'frame', children: [] },
            },
            activeSceneId: 'sceneA',
            scenes: [
                {
                    id: 'sceneA',
                    shots: [{ id: 'shotA', start: 0, duration: 1000, compositionId: 'root' }],
                },
            ],
        },
        assets: {
            images: {},
            videos: {
                'video-a': {
                    id: 'video-a',
                    type: 'video',
                    url: '/video-a.mp4',
                    durationMs: 1000,
                },
            },
            audio: {
                'audio-a': {
                    id: 'audio-a',
                    type: 'audio',
                    url: '/audio-a.wav',
                    durationMs: 1000,
                },
            },
        },
        sequences: {
            activeSequenceId: 'seqA',
            sequences: {
                seqA: {
                    id: 'seqA',
                    frameRate: 24,
                    tracks: {
                        camera: {
                            id: 'camera',
                            type: 'camera',
                            order: 0,
                            clips: {
                                camA: {
                                    id: 'camA',
                                    start: 0,
                                    end: 24,
                                    cameraNodeRef: 'camera-a',
                                },
                            },
                        },
                        video: {
                            id: 'video',
                            type: 'video',
                            order: 1,
                            clips: {
                                clipA: {
                                    id: 'clipA',
                                    start: 0,
                                    end: 24,
                                    assetId: 'video-a',
                                    assetType: 'video',
                                },
                            },
                        },
                        audio: {
                            id: 'audio',
                            type: 'audio',
                            order: 2,
                            clips: {
                                clipB: {
                                    id: 'clipB',
                                    start: 0,
                                    end: 24,
                                    assetId: 'audio-a',
                                    assetType: 'audio',
                                    gainDb: -3,
                                },
                            },
                        },
                    },
                },
            },
        },
        exports: {
            targets: [{ type: 'mp4' }],
        },
    };
    const workspace = {
        document,
        scene: {
            activeSceneId: 'sceneA',
            activeShotId: 'shotA',
        },
        timeline: {
            timelines: {
                default: { tracks: [], duration: 0, events: [] },
            },
        },
        nodes: [],
    };

    const spec = exportDroppleSpec(workspace);
    const result = verifyMediaSequenceOutput({
        mediaExport: spec.media,
        sampleTimes: [0, 500, 999],
        previewAtTime: (timeMs) =>
            evaluateSequenceAtTime({
                document,
                timeMs,
            }),
    });

    assert.equal(result.ok, true);
    assert.deepEqual(result.errors, []);
});
