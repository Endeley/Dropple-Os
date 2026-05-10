import test from 'node:test';
import assert from 'node:assert/strict';

import { exportMotion } from '../exportMotion.js';

function createMotion() {
    return {
        clips: {
            clipB: {
                id: 'clipB',
                target: 'headline',
                property: 'opacity',
                keyframes: [
                    { t: 200, v: 0.5, easing: 'ease-out' },
                    { t: 0, v: 1, easing: 'linear' },
                ],
            },
            clipA: {
                id: 'clipA',
                target: 'hero',
                property: 'x',
                keyframes: [
                    { t: 0, v: 0, easing: 'linear' },
                    { t: 300, v: 120, easing: 'ease-in' },
                ],
            },
        },
    };
}

test('ui exportMotion routes through the runtime motion export command boundary', async () => {
    const output = await exportMotion({
        motion: createMotion(),
        format: 'web-animation',
    });

    assert.equal(Array.isArray(output), true);
    assert.equal(output[0].target, 'hero');
    assert.deepEqual(
        output[0].keyframes.map((keyframe) => keyframe.x),
        ['0px', '120px'],
    );
});
