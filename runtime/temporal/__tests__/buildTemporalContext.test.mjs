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
