import test from 'node:test';
import assert from 'node:assert/strict';

import { exportWAAPI } from '../../waapi/exportWAAPI.js';
import { verifyWaapiOutput } from '../verifyWaapiOutput.js';

test('verifyWaapiOutput matches canonical export JSON against preview samples', () => {
    const state = {
        document: {
            motion: {
                clips: {
                    opacityClip: {
                        id: 'opacityClip',
                        target: 'hero',
                        property: 'opacity',
                        keyframes: [
                            { t: 0, v: 0.2 },
                            { t: 100, v: 1.0 },
                        ],
                    },
                    xClip: {
                        id: 'xClip',
                        target: 'hero',
                        property: 'x',
                        keyframes: [
                            { t: 0, v: 0 },
                            { t: 100, v: 100 },
                        ],
                    },
                    yClip: {
                        id: 'yClip',
                        target: 'hero',
                        property: 'y',
                        keyframes: [
                            { t: 0, v: 10 },
                            { t: 100, v: 30 },
                        ],
                    },
                },
            },
        },
    };

    const waapiOutput = exportWAAPI(state);
    const result = verifyWaapiOutput({
        waapiKeyframesByNode: waapiOutput,
        sampleTimes: [0, 50, 100],
        previewAtTime: (timeMs) => ({
            hero: {
                opacity: 0.2 + (0.8 * timeMs) / 100,
                x: timeMs,
                y: 10 + (20 * timeMs) / 100,
            },
        }),
    });

    assert.equal(result.ok, true);
    assert.deepEqual(result.errors, []);
});
