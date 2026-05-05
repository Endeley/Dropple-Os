import test from 'node:test';
import assert from 'node:assert/strict';

import { exportDroppleSpec } from '../exportDroppleSpec.js';
import { buildEvaluationInputs } from '@/runtime/animation/buildEvaluationInputs.js';
import { evaluateTransitionFrame } from '@/runtime/transition/evaluateTransitionFrame.js';

test('exportDroppleSpec blocks export when strict scene scope is invalid', () => {
    const workspace = {
        document: {
            sceneGraph: {
                rootIds: ['fallback-root'],
                nodes: {
                    'fallback-root': { id: 'fallback-root', type: 'frame', children: [] },
                },
                activeSceneId: 'sceneA',
                scenes: [
                    {
                        id: 'sceneA',
                        shots: [{ id: 'shotA', start: 0, duration: 1000, compositionId: 'missing-root' }],
                    },
                ],
            },
        },
        scene: {
            activeSceneId: 'sceneA',
            activeShotId: 'shotA',
        },
        timeline: {
            timelines: {
                default: { tracks: [], duration: 0, events: [] },
            },
        },
    };

    assert.throws(
        () => exportDroppleSpec({ snapshot: workspace }),
        /extractActiveSceneTree: no valid composition root \(sceneA\)/,
    );
});

test('export transition evaluation matches runtime transition composition at the same time sample', () => {
    const workspace = {
        document: {
            sceneGraph: {
                rootIds: ['fallback-root'],
                nodes: {
                    'fallback-root': { id: 'fallback-root', type: 'frame', children: [] },
                    compA: { id: 'compA', type: 'frame', x: 0, opacity: 1, children: [] },
                    compB: { id: 'compB', type: 'frame', x: 100, opacity: 0.2, children: [] },
                },
                activeSceneId: 'sceneA',
                scenes: [
                    {
                        id: 'sceneA',
                        shots: [
                            {
                                id: 'shotA',
                                start: 0,
                                duration: 1000,
                                compositionId: 'compA',
                                transitionOut: { type: 'crossfade', durationMs: 200 },
                            },
                            {
                                id: 'shotB',
                                start: 1000,
                                duration: 1000,
                                compositionId: 'compB',
                            },
                        ],
                    },
                ],
            },
        },
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

    const inputs = buildEvaluationInputs(workspace, { timeMs: 900, strictSceneScope: true });
    const previewLike = evaluateTransitionFrame({
        shotTimeline: inputs.shotTimeline,
        sceneGraph: workspace.document.sceneGraph,
        activeSceneId: inputs.activeSceneId,
        activeShotId: inputs.activeShotId,
        timeMs: 900,
        cameraTransform: inputs.cameraTransform,
        strictSceneScope: true,
    });
    const exportLike = evaluateTransitionFrame({
        shotTimeline: inputs.shotTimeline,
        sceneGraph: workspace.document.sceneGraph,
        activeSceneId: inputs.activeSceneId,
        activeShotId: inputs.activeShotId,
        timeMs: 900,
        cameraTransform: inputs.cameraTransform,
        strictSceneScope: true,
    });

    assert.deepEqual(exportLike.evaluatedScene, previewLike.evaluatedScene);
    assert.equal(exportLike.transitionWindow.transition.type, 'crossfade');
    assert.doesNotThrow(() => exportDroppleSpec({ snapshot: workspace }));
});

test('exportDroppleSpec includes canonical media assets and sequences without inventing parallel truth', () => {
    const workspace = {
        document: {
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
                            video: {
                                id: 'video',
                                type: 'video',
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
        },
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

    const spec = exportDroppleSpec({ snapshot: workspace });

    assert.equal(spec.media.assets.videos['video-a'].url, '/video-a.mp4');
    assert.equal(spec.media.assets.audio['audio-a'].url, '/audio-a.wav');
    assert.equal(spec.media.sequences.activeSequenceId, 'seqA');
    assert.equal(spec.media.sequences.sequences.seqA.tracks.audio.clips.clipB.gainDb, -3);
    assert.deepEqual(spec.media.exports.targets, [
        {
            id: 'mp4:master',
            type: 'mp4',
            format: 'mp4',
            presetId: null,
            label: null,
            delivery: 'master',
            width: null,
            height: null,
            frameRate: null,
            bitRateKbps: null,
            sampleRate: null,
            channels: null,
            videoCodec: null,
            audioCodec: null,
            includeVideo: true,
            includeAudio: true,
            includeAlpha: false,
            proxy: null,
            options: {},
        },
    ]);
});
