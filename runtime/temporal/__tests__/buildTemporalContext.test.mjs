import test from 'node:test';
import assert from 'node:assert/strict';

import { buildTemporalContext } from '../buildTemporalContext.js';

function createDocument({
    sequences,
    activeSequenceId = null,
    activeSceneId = 'scene-1',
    shots = [],
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

    assert.equal(result.camera.source, 'shot');
    assert.equal(result.camera.shotId, 'shot-a');
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

    assert.equal(result.camera.source, 'sequence');
    assert.equal(result.camera.nodeRef, 'camera-node');
    assert.equal(result.camera.transform.x, 320);
    assert.equal(result.camera.transform.y, 180);
    assert.equal(result.camera.transform.zoom, 1.25);
    assert.equal(result.camera.transform.rotation, 12);
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
