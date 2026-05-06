import test from 'node:test';
import assert from 'node:assert/strict';

import { buildTemporalContext } from '../buildTemporalContext.js';

function createDocument({
    sequences,
    activeSequenceId = null,
    activeSceneId = 'scene-1',
    shots = [],
    assets = null,
} = {}) {
    return {
        sceneGraph: {
            activeSceneId,
            scenes: [
                {
                    id: activeSceneId,
                    shots,
                },
            ],
        },
        sequences: {
            sequences: sequences ?? {},
            activeSequenceId,
        },
        assets: assets ?? {
            images: {},
            videos: {},
            audio: {},
        },
    };
}

test('buildTemporalContext is deterministic', () => {
    const document = createDocument({
        sequences: {
            seqA: {
                id: 'seqA',
                frameRate: 24,
                tracks: {
                    cam: {
                        id: 'cam',
                        type: 'camera',
                        order: 0,
                        clips: {
                            clip1: {
                                id: 'clip1',
                                start: 0,
                                end: 24,
                                cameraNodeRef: 'camera-a',
                            },
                        },
                    },
                },
            },
        },
        activeSequenceId: 'seqA',
        shots: [{ id: 'shot-a', start: 0, duration: 1000 }],
    });
    const runtime = {
        playback: {
            frame: 12,
            timeMs: 500,
        },
        scene: {
            activeSceneId: 'scene-1',
        },
    };

    const left = buildTemporalContext({ document, runtime });
    const right = buildTemporalContext({ document, runtime });

    assert.deepEqual(left, right);
});

test('buildTemporalContext resolves active shot from playback time', () => {
    const document = createDocument({
        sequences: {
            seqA: {
                id: 'seqA',
                frameRate: 24,
                tracks: {},
            },
        },
        activeSequenceId: 'seqA',
        shots: [
            { id: 'shot-a', start: 0, duration: 500 },
            { id: 'shot-b', start: 500, duration: 500 },
        ],
    });
    const runtime = {
        playback: {
            frame: 18,
            timeMs: 650,
        },
        scene: {
            activeSceneId: 'scene-1',
        },
    };

    const result = buildTemporalContext({ document, runtime });

    assert.equal(result.sequenceId, 'seqA');
    assert.equal(result.activeShot?.shotId, 'shot-b');
    assert.equal(result.activeShot?.sceneId, 'scene-1');
    assert.equal(result.activeShot?.localTime, 150);
});

test('buildTemporalContext resolves shot camera before sequence camera', () => {
    const document = createDocument({
        sequences: {
            seqA: {
                id: 'seqA',
                frameRate: 24,
                tracks: {
                    cam: {
                        id: 'cam',
                        type: 'camera',
                        order: 0,
                        clips: {
                            clip1: {
                                id: 'clip1',
                                start: 0,
                                end: 24,
                                cameraNodeRef: 'camera-node',
                            },
                        },
                    },
                },
            },
        },
        activeSequenceId: 'seqA',
        shots: [
            {
                id: 'shot-a',
                start: 0,
                duration: 1000,
                camera: {
                    keyframes: [
                        { time: 0, x: 10, y: 20, zoom: 1, rotation: 0 },
                        { time: 1000, x: 30, y: 40, zoom: 2, rotation: 15 },
                    ],
                },
            },
        ],
    });
    document.sceneGraph.nodes = {
        'camera-node': {
            id: 'camera-node',
            props: {
                transform: {
                    x: 320,
                    y: 180,
                    scale: 1.25,
                    rotation: 12,
                },
            },
        },
    };

    const runtime = {
        playback: {
            frame: 12,
            timeMs: 500,
        },
        scene: {
            activeSceneId: 'scene-1',
        },
    };

    const result = buildTemporalContext({ document, runtime });

    assert.equal(result.activeCamera.nodeRef, 'camera-node');
    assert.equal(result.camera.source, 'shot');
    assert.equal(result.camera.resolvedFrom, 'shot-track');
    assert.equal(result.camera.shotId, 'shot-a');
    assert.equal(result.camera.timeMs, 500);
    assert.equal(result.camera.nodeRef, null);
    assert.equal(result.camera.transform.x, 20);
    assert.equal(result.camera.transform.y, 30);
    assert.equal(result.camera.transform.zoom, 1.5);
    assert.equal(result.camera.transform.rotation, 7.5);
});

test('buildTemporalContext falls back to sequence camera when shot camera is absent', () => {
    const document = createDocument({
        sequences: {
            seqA: {
                id: 'seqA',
                frameRate: 24,
                tracks: {
                    cam: {
                        id: 'cam',
                        type: 'camera',
                        order: 0,
                        clips: {
                            clip1: {
                                id: 'clip1',
                                start: 0,
                                end: 24,
                                cameraNodeRef: 'camera-node',
                            },
                        },
                    },
                },
            },
        },
        activeSequenceId: 'seqA',
        shots: [{ id: 'shot-a', start: 0, duration: 1000 }],
    });
    document.sceneGraph.nodes = {
        'camera-node': {
            id: 'camera-node',
            props: {
                transform: {
                    x: 320,
                    y: 180,
                    scale: 1.25,
                    rotation: 12,
                },
            },
        },
    };
    const runtime = {
        playback: {
            frame: 12,
            timeMs: 500,
        },
        scene: {
            activeSceneId: 'scene-1',
        },
    };

    const result = buildTemporalContext({ document, runtime });

    assert.equal(result.activeCamera.nodeRef, 'camera-node');
    assert.equal(result.activeCamera.sourceType, 'camera-track');
    assert.equal(result.activeCamera.startTime, 0);
    assert.equal(result.activeCamera.endTime, 24);
    assert.equal(result.activeCamera.priority, 0);
    assert.equal(result.camera.source, 'sequence');
    assert.equal(result.camera.resolvedFrom, 'camera-track');
    assert.equal(result.camera.sequenceId, 'seqA');
    assert.equal(result.camera.trackId, 'cam');
    assert.equal(result.camera.clipId, 'clip1');
    assert.equal(result.camera.timeMs, 500);
    assert.equal(result.camera.nodeRef, 'camera-node');
    assert.equal(result.camera.transform.x, 320);
    assert.equal(result.camera.transform.y, 180);
    assert.equal(result.camera.transform.zoom, 1.25);
    assert.equal(result.camera.transform.rotation, 12);
});

test('buildTemporalContext blends shot cameras only inside explicit crossfade windows', () => {
    const document = createDocument({
        sequences: {
            seqA: {
                id: 'seqA',
                frameRate: 24,
                tracks: {},
            },
        },
        activeSequenceId: 'seqA',
        shots: [
            {
                id: 'shot-a',
                start: 0,
                duration: 1000,
                transitionOut: { type: 'crossfade', durationMs: 200 },
                camera: {
                    keyframes: [{ time: 0, x: 0, y: 0, zoom: 1, rotation: 0 }],
                },
            },
            {
                id: 'shot-b',
                start: 1000,
                duration: 1000,
                camera: {
                    keyframes: [{ time: 0, x: 100, y: 50, zoom: 2, rotation: 20 }],
                },
            },
        ],
    });

    const beforeWindow = buildTemporalContext({
        document,
        runtime: {
            playback: { timeMs: 750 },
            scene: { activeSceneId: 'scene-1' },
        },
    });
    assert.equal(beforeWindow.camera.resolvedFrom, 'shot-track');
    assert.equal(beforeWindow.camera.transition, undefined);
    assert.equal(beforeWindow.camera.transform.x, 0);

    const duringWindow = buildTemporalContext({
        document,
        runtime: {
            playback: { timeMs: 900 },
            scene: { activeSceneId: 'scene-1' },
        },
    });
    assert.equal(duringWindow.camera.resolvedFrom, 'transition-crossfade');
    assert.equal(duringWindow.camera.transition?.active, true);
    assert.equal(duringWindow.camera.transition?.fromShotId, 'shot-a');
    assert.equal(duringWindow.camera.transition?.toShotId, 'shot-b');
    assert.equal(duringWindow.camera.transition?.progress, 0.5);
    assert.equal(duringWindow.camera.transform.x, 50);
    assert.equal(duringWindow.camera.transform.y, 25);
    assert.equal(duringWindow.camera.transform.zoom, 1.5);
    assert.equal(duringWindow.camera.transform.rotation, 10);
});

test('buildTemporalContext is boundary-deterministic at explicit crossfade start and end', () => {
    const document = createDocument({
        sequences: {
            seqA: {
                id: 'seqA',
                frameRate: 24,
                tracks: {},
            },
        },
        activeSequenceId: 'seqA',
        shots: [
            {
                id: 'shot-a',
                start: 0,
                duration: 1000,
                transitionOut: { type: 'crossfade', durationMs: 200 },
                camera: {
                    keyframes: [{ time: 0, x: 0, y: 0, zoom: 1, rotation: 0 }],
                },
            },
            {
                id: 'shot-b',
                start: 1000,
                duration: 1000,
                camera: {
                    keyframes: [{ time: 0, x: 100, y: 50, zoom: 2, rotation: 20 }],
                },
            },
        ],
    });

    const atWindowStart = buildTemporalContext({
        document,
        runtime: {
            playback: { timeMs: 800 },
            scene: { activeSceneId: 'scene-1' },
        },
    });
    const atWindowEnd = buildTemporalContext({
        document,
        runtime: {
            playback: { timeMs: 1000 },
            scene: { activeSceneId: 'scene-1' },
        },
    });
    const afterWindow = buildTemporalContext({
        document,
        runtime: {
            playback: { timeMs: 1001 },
            scene: { activeSceneId: 'scene-1' },
        },
    });

    assert.equal(atWindowStart.camera.resolvedFrom, 'transition-crossfade');
    assert.equal(atWindowStart.camera.transition?.progress, 0);
    assert.equal(atWindowStart.camera.transform.x, 0);
    assert.equal(atWindowStart.camera.transform.y, 0);

    assert.equal(atWindowEnd.camera.resolvedFrom, 'transition-crossfade');
    assert.equal(atWindowEnd.camera.transition?.progress, 1);
    assert.equal(atWindowEnd.camera.transform.x, 100);
    assert.equal(atWindowEnd.camera.transform.y, 50);

    assert.equal(afterWindow.camera.resolvedFrom, 'shot-track');
    assert.equal(afterWindow.camera.shotId, 'shot-b');
    assert.equal(afterWindow.camera.transform.x, 100);
    assert.equal(afterWindow.camera.transform.y, 50);
});

test('buildTemporalContext blends shot camera into sequence fallback when next shot has no camera', () => {
    const document = createDocument({
        sequences: {
            seqA: {
                id: 'seqA',
                frameRate: 24,
                tracks: {
                    cam: {
                        id: 'cam',
                        type: 'camera',
                        order: 0,
                        clips: {
                            clip1: {
                                id: 'clip1',
                                start: 0,
                                end: 48,
                                cameraNodeRef: 'camera-node',
                            },
                        },
                    },
                },
            },
        },
        activeSequenceId: 'seqA',
        shots: [
            {
                id: 'shot-a',
                start: 0,
                duration: 1000,
                transitionOut: { type: 'crossfade', durationMs: 200 },
                camera: {
                    keyframes: [{ time: 0, x: 0, y: 0, zoom: 1, rotation: 0 }],
                },
            },
            {
                id: 'shot-b',
                start: 1000,
                duration: 1000,
            },
        ],
    });
    document.sceneGraph.nodes = {
        'camera-node': {
            id: 'camera-node',
            props: {
                transform: {
                    x: 320,
                    y: 180,
                    scale: 1.25,
                    rotation: 12,
                },
            },
        },
    };

    const result = buildTemporalContext({
        document,
        runtime: {
            playback: { timeMs: 900 },
            scene: { activeSceneId: 'scene-1' },
        },
    });

    assert.equal(result.camera.resolvedFrom, 'transition-crossfade');
    assert.equal(result.camera.transition?.progress, 0.5);
    assert.equal(result.camera.transform.x, 160);
    assert.equal(result.camera.transform.y, 90);
    assert.equal(result.camera.transform.zoom, 1.125);
    assert.equal(result.camera.transform.rotation, 6);
});

test('buildTemporalContext does not invent camera blending when neither shot owns camera', () => {
    const document = createDocument({
        sequences: {
            seqA: {
                id: 'seqA',
                frameRate: 24,
                tracks: {
                    cam: {
                        id: 'cam',
                        type: 'camera',
                        order: 0,
                        clips: {
                            clip1: {
                                id: 'clip1',
                                start: 0,
                                end: 48,
                                cameraNodeRef: 'camera-node',
                            },
                        },
                    },
                },
            },
        },
        activeSequenceId: 'seqA',
        shots: [
            {
                id: 'shot-a',
                start: 0,
                duration: 1000,
                transitionOut: { type: 'crossfade', durationMs: 200 },
            },
            {
                id: 'shot-b',
                start: 1000,
                duration: 1000,
            },
        ],
    });
    document.sceneGraph.nodes = {
        'camera-node': {
            id: 'camera-node',
            props: {
                transform: {
                    x: 320,
                    y: 180,
                    scale: 1.25,
                    rotation: 12,
                },
            },
        },
    };

    const result = buildTemporalContext({
        document,
        runtime: {
            playback: { timeMs: 900 },
            scene: { activeSceneId: 'scene-1' },
        },
    });

    assert.equal(result.camera.source, 'sequence');
    assert.equal(result.camera.resolvedFrom, 'camera-track');
    assert.equal(result.camera.transition, null);
    assert.equal(result.camera.transform.x, 320);
    assert.equal(result.camera.transform.y, 180);
});

test('buildTemporalContext rejects ambiguous one-sided camera authority during a crossfade', () => {
    const document = createDocument({
        sequences: {},
        activeSequenceId: null,
        shots: [
            {
                id: 'shot-a',
                start: 0,
                duration: 1000,
                transitionOut: { type: 'crossfade', durationMs: 200 },
                camera: {
                    keyframes: [{ time: 0, x: 0, y: 0, zoom: 1, rotation: 0 }],
                },
            },
            {
                id: 'shot-b',
                start: 1000,
                duration: 1000,
            },
        ],
    });

    assert.throws(
        () =>
            buildTemporalContext({
                document,
                runtime: {
                    playback: { timeMs: 900 },
                    scene: { activeSceneId: 'scene-1' },
                },
            }),
        /camera transition governance: ambiguous authority across transition shot-a -> shot-b/,
    );
});

test('buildTemporalContext returns empty sequence context when no sequence exists', () => {
    const result = buildTemporalContext({
        document: createDocument({
            sequences: {},
            activeSequenceId: null,
            shots: [],
        }),
        runtime: {},
    });

    assert.equal(result.sequenceId, null);
    assert.deepEqual(result.activeClips, []);
    assert.equal(result.activeShot, null);
    assert.equal(result.activeCamera, null);
});

test('buildTemporalContext carries active audio and video clip truth from the canonical sequence evaluation', () => {
    const document = createDocument({
        sequences: {
            seqA: {
                id: 'seqA',
                frameRate: 24,
                tracks: {
                    video: {
                        id: 'video',
                        type: 'video',
                        order: 0,
                        clips: {
                            clipVideo: {
                                id: 'clipVideo',
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
                        order: 1,
                        clips: {
                            clipAudio: {
                                id: 'clipAudio',
                                start: 0,
                                end: 24,
                                assetId: 'audio-a',
                                assetType: 'audio',
                                gainDb: -6,
                            },
                        },
                    },
                },
            },
        },
        activeSequenceId: 'seqA',
        assets: {
            images: {},
            videos: {
                'video-a': {
                    id: 'video-a',
                    type: 'video',
                    url: '/video-a.mp4',
                },
            },
            audio: {
                'audio-a': {
                    id: 'audio-a',
                    type: 'audio',
                    url: '/audio-a.wav',
                },
            },
        },
        shots: [{ id: 'shot-a', start: 0, duration: 1000 }],
    });
    const runtime = {
        playback: {
            frame: 12,
            timeMs: 500,
        },
        scene: {
            activeSceneId: 'scene-1',
        },
    };

    const result = buildTemporalContext({ document, runtime });

    assert.equal(result.activeVideoClips.length, 1);
    assert.equal(result.activeAudioClips.length, 1);
    assert.equal(result.activeVideoClips[0].asset.url, '/video-a.mp4');
    assert.equal(result.activeAudioClips[0].asset.url, '/audio-a.wav');
    assert.equal(result.activeAudioClips[0].clip.gainDb, -6);
});

test('buildTemporalContext does not fall back to document activeSceneId when runtime scene differs', () => {
    const document = {
        sceneGraph: {
            activeSceneId: 'scene-a',
            scenes: [
                {
                    id: 'scene-a',
                    shots: [{ id: 'shot-a', start: 0, duration: 500 }],
                },
                {
                    id: 'scene-b',
                    shots: [{ id: 'shot-b', start: 0, duration: 500 }],
                },
            ],
        },
        sequences: {
            sequences: {},
            activeSequenceId: null,
        },
    };
    const runtime = {
        playback: {
            timeMs: 100,
        },
        scene: {
            activeSceneId: 'scene-b',
        },
    };

    const result = buildTemporalContext({ document, runtime });

    assert.equal(result.activeShot?.sceneId, 'scene-b');
    assert.equal(result.activeShot?.shotId, 'shot-b');
});

test('buildTemporalContext repairs invalid runtime scene selection back to canonical document truth', () => {
    const document = {
        sceneGraph: {
            activeSceneId: 'scene-a',
            activeShotId: 'shot-a',
            scenes: [
                {
                    id: 'scene-a',
                    duration: 500,
                    shots: [{ id: 'shot-a', start: 0, duration: 500 }],
                },
            ],
        },
        sequences: {
            sequences: {},
            activeSequenceId: null,
        },
    };
    const runtime = {
        playback: {
            timeMs: 100,
        },
        scene: {
            activeSceneId: 'missing-scene',
            activeShotId: 'missing-shot',
        },
    };

    const result = buildTemporalContext({ document, runtime });

    assert.equal(result.activeShot?.sceneId, 'scene-a');
    assert.equal(result.activeShot?.shotId, 'shot-a');
});

test('buildTemporalContext is stable under sequence track and clip reordering', () => {
    const sequenceA = {
        id: 'seqA',
        frameRate: 24,
        tracks: {
            b: {
                id: 'b',
                type: 'animation',
                order: 1,
                clips: {
                    clip2: { id: 'clip2', start: 10, end: 20, animationRef: 'run' },
                },
            },
            a: {
                id: 'a',
                type: 'camera',
                order: 0,
                clips: {
                    clip1: { id: 'clip1', start: 0, end: 30, cameraNodeRef: 'camera-a' },
                },
            },
        },
    };
    const sequenceB = {
        id: 'seqA',
        frameRate: 24,
        tracks: {
            a: {
                id: 'a',
                type: 'camera',
                order: 0,
                clips: {
                    clip1: { id: 'clip1', start: 0, end: 30, cameraNodeRef: 'camera-a' },
                },
            },
            b: {
                id: 'b',
                type: 'animation',
                order: 1,
                clips: {
                    clip2: { id: 'clip2', start: 10, end: 20, animationRef: 'run' },
                },
            },
        },
    };
    const runtime = {
        playback: {
            frame: 12,
            timeMs: 500,
        },
        scene: {
            activeSceneId: 'scene-1',
        },
    };

    const left = buildTemporalContext({
        document: createDocument({
            sequences: { seqA: sequenceA },
            activeSequenceId: 'seqA',
            shots: [{ id: 'shot-a', start: 0, duration: 1000 }],
        }),
        runtime,
    });
    const right = buildTemporalContext({
        document: createDocument({
            sequences: { seqA: sequenceB },
            activeSequenceId: 'seqA',
            shots: [{ id: 'shot-a', start: 0, duration: 1000 }],
        }),
        runtime,
    });

    assert.deepEqual(left, right);
});
