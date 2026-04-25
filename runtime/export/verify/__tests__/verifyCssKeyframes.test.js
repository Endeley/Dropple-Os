import test from 'node:test';
import assert from 'node:assert/strict';

import { exportCSS } from '../../css/exportCSS.js';
import { verifyCssKeyframes } from '../verifyCssKeyframes.js';

test('verifyCssKeyframes matches canonical CSS export against preview samples', () => {
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

    const cssText = exportCSS(state);
    const result = verifyCssKeyframes({
        cssText,
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
