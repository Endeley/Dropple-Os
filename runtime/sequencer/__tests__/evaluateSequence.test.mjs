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
