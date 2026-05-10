import test from 'node:test';
import assert from 'node:assert/strict';

import { exportMotion } from '../exportMotion.js';
import { generateExportPair } from '../generateExportPair.js';
import { exportCSS } from '../css/exportCSS.js';
import { exportWAAPI } from '../waapi/exportWAAPI.js';

function createState() {
    return {
        document: {
            motion: {
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
            },
        },
    };
}

test('runtime exportMotion preserves stable css export contract through canonical motion authority', () => {
    const output = exportMotion(createState(), 'css');

    assert.equal(typeof output, 'string');
    assert.match(output, /@keyframes kf_hero_x_0/);
    assert.match(output, /translateX\(120px\)/);
});

test('runtime exportMotion preserves stable waapi export contract through canonical motion authority', () => {
    const output = exportMotion(createState(), 'waapi');
    const parsed = JSON.parse(output);

    assert.equal(parsed.type, 'waapi');
    assert.equal(Array.isArray(parsed.animations), true);
    assert.equal(parsed.animations[0].target, 'hero');
    assert.equal(parsed.animations[1].property, 'opacity');
});

test('exportCSS and exportWAAPI remain deterministic wrappers over canonical motion commands', () => {
    const cssLeft = exportCSS(createState());
    const cssRight = exportCSS(createState());
    const waapiLeft = exportWAAPI(createState());
    const waapiRight = exportWAAPI(createState());

    assert.equal(cssLeft, cssRight);
    assert.equal(waapiLeft, waapiRight);
});

test('generateExportPair normalizes canonical wrapper output for stable diffing', () => {
    const state = createState();
    const pair = generateExportPair({
        beforeState: state,
        afterState: state,
        format: 'css',
    });

    assert.equal(pair.before, pair.after);
    assert.match(pair.before, /@keyframes/);
});
