import test from 'node:test';
import assert from 'node:assert/strict';

import {
    assertSceneGraphInvariants,
    resolveCanonicalSceneSelection,
} from '@/core/scene/sceneGraphInvariants.js';

test('resolveCanonicalSceneSelection repairs invalid active shot pointers against canonical scene truth', () => {
    const sceneGraph = {
        activeSceneId: 'scene-a',
        activeShotId: 'missing-shot',
        scenes: [
            {
                id: 'scene-a',
                duration: 1000,
                shots: [
                    {
                        id: 'shot-a',
                        start: 0,
                        duration: 1000,
                        compositionId: 'comp-a',
                    },
                ],
            },
        ],
    };

    const result = resolveCanonicalSceneSelection({
        sceneGraph,
        preferredSceneId: 'scene-a',
        preferredShotId: 'also-missing',
    });

    assert.deepEqual(result, {
        activeSceneId: 'scene-a',
        activeShotId: 'shot-a',
    });
});

test('assertSceneGraphInvariants rejects overlapping canonical shots', () => {
    const sceneGraph = {
        activeSceneId: 'scene-a',
        activeShotId: 'shot-a',
        scenes: [
            {
                id: 'scene-a',
                duration: 1000,
                shots: [
                    {
                        id: 'shot-a',
                        start: 0,
                        duration: 700,
                        compositionId: 'comp-a',
                    },
                    {
                        id: 'shot-b',
                        start: 600,
                        duration: 200,
                        compositionId: 'comp-b',
                    },
                ],
            },
        ],
    };

    assert.throws(
        () =>
            assertSceneGraphInvariants({
                sceneGraph,
                activeSceneId: 'scene-a',
                activeShotId: 'shot-a',
                requireActiveShot: false,
            }),
        /sceneGraph: shots must not overlap \(scene-a:shot-b\)/,
    );
});

test('assertSceneGraphInvariants rejects camera keys outside shot duration', () => {
    const sceneGraph = {
        activeSceneId: 'scene-a',
        activeShotId: 'shot-a',
        scenes: [
            {
                id: 'scene-a',
                duration: 1000,
                shots: [
                    {
                        id: 'shot-a',
                        start: 0,
                        duration: 500,
                        compositionId: 'comp-a',
                        camera: {
                            keyframes: [{ time: 600, x: 0, y: 0, zoom: 1 }],
                        },
                    },
                ],
            },
        ],
    };

    assert.throws(
        () =>
            assertSceneGraphInvariants({
                sceneGraph,
                activeSceneId: 'scene-a',
                activeShotId: 'shot-a',
                requireActiveShot: false,
            }),
        /sceneGraph: camera keyframes must be within shot duration \(scene-a:shot-a\)/,
    );
});
