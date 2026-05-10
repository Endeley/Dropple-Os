import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createMotionExportCommand,
    performMotionExportCommand,
} from '../motionExportCommands.js';

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

test('createMotionExportCommand is deterministic for the same state and format', () => {
    const left = createMotionExportCommand({
        state: createState(),
        format: 'web-animation',
    });
    const right = createMotionExportCommand({
        state: createState(),
        format: 'web-animation',
    });

    assert.equal(left.manifest.manifestId, right.manifest.manifestId);
    assert.equal(left.manifest.clipCount, 2);
    assert.equal(left.manifest.targetCount, 2);
});

test('createMotionExportCommand changes identity when format changes', () => {
    const web = createMotionExportCommand({
        state: createState(),
        format: 'web-animation',
    });
    const css = createMotionExportCommand({
        state: createState(),
        format: 'css',
    });

    assert.notEqual(web.manifest.manifestId, css.manifest.manifestId);
});

test('performMotionExportCommand returns deterministic web animation output', () => {
    const left = performMotionExportCommand({
        state: createState(),
        format: 'web-animation',
    });
    const right = performMotionExportCommand({
        state: createState(),
        format: 'web-animation',
    });

    assert.deepEqual(left, right);
    assert.equal(Array.isArray(left.output), true);
    assert.equal(left.output[0].target, 'hero');
});

test('performMotionExportCommand supports css and waapi motion export families', () => {
    const css = performMotionExportCommand({
        state: createState(),
        format: 'css',
    });
    const waapi = performMotionExportCommand({
        state: createState(),
        format: 'waapi',
    });

    assert.equal(Array.isArray(css.output), true);
    assert.equal(Array.isArray(waapi.output), true);
    assert.equal(css.manifest.format, 'css');
    assert.equal(waapi.manifest.format, 'waapi');
    assert.equal(css.output[0].target, 'hero');
    assert.equal(waapi.output[0].tracks[0].nodeId, 'hero');
});

test('performMotionExportCommand normalizes keyframe order before export', () => {
    const result = performMotionExportCommand({
        state: createState(),
        format: 'web-animation',
    });

    assert.deepEqual(
        result.output[0].keyframes.map((keyframe) => keyframe.x),
        ['0px', '120px'],
    );
    assert.deepEqual(
        result.output[1].keyframes.map((keyframe) => keyframe.opacity),
        [1, 0.5],
    );
});
