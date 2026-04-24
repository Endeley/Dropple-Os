import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateShotAt } from './evaluateShotAt.js';

function createScene() {
    return {
        id: 'root',
        type: 'frame',
        channels: {
            'transform.x': 0,
            'transform.y': 0,
            opacity: 1,
        },
        children: [
            {
                id: 'hero',
                type: 'frame',
                channels: {
                    'transform.x': 10,
                    'transform.y': 0,
                    opacity: 1,
                },
                children: [],
            },
            {
                id: 'sidebar',
                type: 'frame',
                channels: {
                    'transform.x': 40,
                    'transform.y': 0,
                    opacity: 1,
                },
                children: [],
            },
        ],
    };
}

function createShotTimeline({ tracks, channels }) {
    return {
        shots: [
            {
                id: 'intro',
                startMs: 0,
                endMs: 1000,
                timeline: {
                    duration: 1000,
                    tracks,
                    channels,
                },
            },
        ],
    };
}

test('evaluateShotAt applies targeted transform channels only to the addressed node', () => {
    const scene = createScene();
    const shotTimeline = createShotTimeline({
        tracks: [{ id: 't1', type: 'standard', order: 0, channelIds: ['transform.y'] }],
        channels: [
            {
                id: 'transform.y',
                target: 'hero',
                property: 'translateY',
                keyframes: [{ time: 0, value: 12 }],
            },
        ],
    });

    const result = evaluateShotAt(shotTimeline, scene, 0, { shotId: 'intro' });
    assert.equal(result.ok, true);
    assert.equal(result.evaluatedScene.worldTransform.y, 0);
    assert.equal(result.evaluatedScene.children[0].id, 'hero');
    assert.equal(result.evaluatedScene.children[0].worldTransform.y, 12);
    assert.equal(result.evaluatedScene.children[1].id, 'sidebar');
    assert.equal(result.evaluatedScene.children[1].worldTransform.y, 0);
});

test('evaluateShotAt falls back untargeted channels to the root node for legacy timelines', () => {
    const scene = createScene();
    const shotTimeline = createShotTimeline({
        tracks: [{ id: 't1', type: 'standard', order: 0, channelIds: ['transform.y'] }],
        channels: [
            {
                id: 'transform.y',
                keyframes: [{ time: 0, value: 8 }],
            },
        ],
    });

    const result = evaluateShotAt(shotTimeline, scene, 0, { shotId: 'intro' });
    assert.equal(result.ok, true);
    assert.equal(result.evaluatedScene.worldTransform.y, 8);
    assert.equal(result.evaluatedScene.children[0].worldTransform.y, 8);
    assert.equal(result.evaluatedScene.children[1].worldTransform.y, 8);
});

test('evaluateShotAt keeps targeted transform blend order deterministic without leaking to siblings', () => {
    const scene = createScene();
    const channel = {
        id: 'transform.y',
        target: 'hero',
        property: 'translateY',
        keyframes: [{ time: 0, value: 6 }],
    };

    const overlayLast = createShotTimeline({
        tracks: [
            { id: 't1', type: 'standard', order: 0, channelIds: ['transform.y'] },
            { id: 't2', type: 'overlay', order: 1, channelIds: ['transform.y'] },
        ],
        channels: [channel],
    });

    const overlayFirst = createShotTimeline({
        tracks: [
            { id: 't1', type: 'overlay', order: 0, channelIds: ['transform.y'] },
            { id: 't2', type: 'standard', order: 1, channelIds: ['transform.y'] },
        ],
        channels: [channel],
    });

    const overlayLastResult = evaluateShotAt(overlayLast, scene, 0, { shotId: 'intro' });
    const overlayFirstResult = evaluateShotAt(overlayFirst, scene, 0, { shotId: 'intro' });

    assert.equal(overlayLastResult.ok, true);
    assert.equal(overlayFirstResult.ok, true);
    assert.equal(overlayLastResult.evaluatedScene.children[0].worldTransform.y, 6);
    assert.equal(overlayFirstResult.evaluatedScene.children[0].worldTransform.y, 12);
    assert.equal(overlayLastResult.evaluatedScene.children[1].worldTransform.y, 0);
    assert.equal(overlayFirstResult.evaluatedScene.children[1].worldTransform.y, 0);
});
