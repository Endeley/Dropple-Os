import test from 'node:test';
import assert from 'node:assert/strict';

import {
    selectShotInspectorView,
    selectShotTimelineView,
} from '@/runtime/projection/selectors/shotTimelineSelectors.js';

test('selectShotTimelineView orders shots deterministically and resolves timing fields', () => {
    const result = selectShotTimelineView({
        sceneGraph: {
            scenes: [
                {
                    id: 'scene-a',
                    shotTracks: [
                        {
                            id: 'primary',
                            order: 0,
                            shots: [
                                { id: 'shot-b', start: 500, duration: 200, name: 'Shot B' },
                                { id: 'shot-a', startMs: 100, endMs: 300, name: 'Shot A' },
                                { id: 'shot-c', start: 500, duration: 300, name: 'Shot C' },
                            ],
                        },
                        {
                            id: 'secondary',
                            order: 1,
                            shots: [{ id: 'shot-d', start: 50, duration: 50, name: 'Shot D' }],
                        },
                    ],
                },
            ],
        },
        runtimeScene: {
            activeSceneId: 'scene-a',
            activeShotId: 'shot-c',
        },
    });

    assert.deepEqual(
        result.tracks.map((track) => track.id),
        ['primary', 'secondary'],
    );
    assert.deepEqual(
        result.tracks[0].shots.map((shot) => shot.id),
        ['shot-a', 'shot-b', 'shot-c'],
    );
    assert.equal(result.tracks[0].shots[0].startMs, 100);
    assert.equal(result.tracks[0].shots[0].endMs, 300);
    assert.equal(result.tracks[0].shots[0].durationMs, 200);
    assert.equal(result.tracks[0].shots[2].isActive, true);
    assert.equal(result.totalDuration, 800);
});

test('selectShotTimelineView synthesizes a primary track for legacy scene.shots', () => {
    const result = selectShotTimelineView({
        sceneGraph: {
            scenes: [
                {
                    id: 'scene-a',
                    shots: [
                        { id: 'shot-b', start: 500, duration: 200, name: 'Shot B' },
                        { id: 'shot-a', startMs: 100, endMs: 300, name: 'Shot A' },
                    ],
                },
            ],
        },
        runtimeScene: {
            activeSceneId: 'scene-a',
            activeShotId: 'shot-a',
        },
    });

    assert.equal(result.tracks.length, 1);
    assert.equal(result.tracks[0].id, 'primary');
    assert.deepEqual(
        result.tracks[0].shots.map((shot) => shot.id),
        ['shot-a', 'shot-b'],
    );
});

test('selectShotTimelineView marks adjacent shots for transition rendering', () => {
    const result = selectShotTimelineView({
        sceneGraph: {
            scenes: [
                {
                    id: 'scene-a',
                    shotTracks: [
                        {
                            id: 'primary',
                            order: 0,
                            shots: [
                                { id: 'shot-a', start: 0, duration: 500 },
                                { id: 'shot-b', start: 500, duration: 400 },
                                { id: 'shot-c', start: 950, duration: 100 },
                            ],
                        },
                    ],
                },
            ],
        },
        runtimeScene: {
            activeSceneId: 'scene-a',
            activeShotId: 'shot-a',
        },
    });

    assert.equal(result.tracks[0].shots[0].hasAdjacentNextShot, true);
    assert.equal(result.tracks[0].shots[1].hasAdjacentNextShot, false);
});

test('selectShotTimelineView returns null when active scene has no shots', () => {
    const result = selectShotTimelineView({
        sceneGraph: {
            scenes: [{ id: 'scene-a', shots: [] }],
        },
        runtimeScene: {
            activeSceneId: 'scene-a',
            activeShotId: null,
        },
    });

    assert.equal(result, null);
});

test('selectShotInspectorView projects the active shot and owning track', () => {
    const result = selectShotInspectorView({
        sceneGraph: {
            scenes: [
                {
                    id: 'scene-a',
                    shotTracks: [
                        {
                            id: 'primary',
                            order: 0,
                            shots: [
                                { id: 'shot-a', start: 0, duration: 500, compositionId: 'comp-a' },
                                { id: 'shot-b', start: 500, duration: 400, compositionId: 'comp-b' },
                            ],
                        },
                    ],
                },
            ],
        },
        runtimeScene: {
            activeSceneId: 'scene-a',
            activeShotId: 'shot-a',
        },
    });

    assert.equal(result?.activeTrackId, 'primary');
    assert.equal(result?.track?.shotCount, 2);
    assert.equal(result?.shot?.id, 'shot-a');
    assert.equal(result?.nextShot?.id, 'shot-b');
    assert.equal(result?.canEditCrossfade, true);
});

test('selectShotInspectorView falls back to the first track when no active shot is set', () => {
    const result = selectShotInspectorView({
        sceneGraph: {
            scenes: [
                {
                    id: 'scene-a',
                    shotTracks: [
                        {
                            id: 'primary',
                            order: 0,
                            shots: [{ id: 'shot-a', start: 0, duration: 500, compositionId: 'comp-a' }],
                        },
                        {
                            id: 'secondary',
                            order: 1,
                            shots: [{ id: 'shot-b', start: 500, duration: 400, compositionId: 'comp-b' }],
                        },
                    ],
                },
            ],
        },
        runtimeScene: {
            activeSceneId: 'scene-a',
            activeShotId: null,
        },
    });

    assert.equal(result?.activeTrackId, 'primary');
    assert.equal(result?.shot, null);
});
