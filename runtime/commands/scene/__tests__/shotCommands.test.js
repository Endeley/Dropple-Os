import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createSceneShotTrackCreateEvent,
    createSceneShotCreateEvent,
    createSceneShotDeleteEvent,
    createSceneShotMoveEvent,
    createSceneShotUpdateEvent,
    createShotSetActiveEvent,
} from '../shotCommands.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { ShotTransitionValidationError } from '@/core/project/normalizeShotTransitionOut.js';

function createRuntimeState() {
    return {
        scene: {
            activeSceneId: 'scene-a',
        },
        document: {
            sceneGraph: {
                activeSceneId: 'scene-b',
                activeShotId: 'shot-a',
                nodes: {},
                scenes: [
                    {
                        id: 'scene-a',
                        shots: [
                            { id: 'shot-a', compositionId: 'comp-a', start: 0, duration: 1000 },
                            { id: 'shot-b', compositionId: 'comp-b', start: 1000, duration: 1000 },
                        ],
                    },
                    {
                        id: 'scene-b',
                        shots: [{ id: 'shot-c', compositionId: 'comp-c', start: 0, duration: 1000 }],
                    },
                ],
            },
        },
    };
}

test('createSceneShotCreateEvent resolves scene authority from runtime scene', () => {
    const event = createSceneShotCreateEvent({
        runtimeState: createRuntimeState(),
        shot: {
            id: 'shot-new',
            compositionId: 'comp-new',
            start: 2000,
            duration: 500,
        },
    });

    assert.equal(event?.type, EventTypes.SCENE_SHOT_CREATE);
    assert.equal(event?.payload?.sceneId, 'scene-a');
    assert.equal(event?.payload?.trackId, 'primary');
    assert.equal(event?.payload?.shot?.id, 'shot-new');
});

test('createSceneShotTrackCreateEvent resolves scene authority from runtime scene', () => {
    const event = createSceneShotTrackCreateEvent({
        runtimeState: createRuntimeState(),
        track: {
            id: 'secondary',
            order: 1,
            kind: 'shot',
        },
    });

    assert.equal(event?.type, EventTypes.SCENE_SHOT_TRACK_CREATE);
    assert.equal(event?.payload?.sceneId, 'scene-a');
    assert.equal(event?.payload?.track?.id, 'secondary');
});

test('createSceneShotCreateEvent does not allow payload sceneId to override runtime scene authority', () => {
    const event = createSceneShotCreateEvent({
        runtimeState: createRuntimeState(),
        sceneId: 'scene-b',
        shot: {
            id: 'shot-new',
            compositionId: 'comp-new',
            start: 2000,
            duration: 500,
        },
    });

    assert.equal(event?.type, EventTypes.SCENE_SHOT_CREATE);
    assert.equal(event?.payload?.sceneId, 'scene-a');
});

test('createSceneShotCreateEvent rejects unsupported transition metadata before dispatch', () => {
    assert.throws(
        () =>
            createSceneShotCreateEvent({
                runtimeState: createRuntimeState(),
                shot: {
                    id: 'shot-new',
                    compositionId: 'comp-new',
                    start: 2000,
                    duration: 500,
                    transitionOut: { type: 'wipe', durationMs: 100 },
                },
            }),
        ShotTransitionValidationError,
    );
});

test('createSceneShotUpdateEvent rejects shots outside the active runtime scene', () => {
    const event = createSceneShotUpdateEvent({
        runtimeState: createRuntimeState(),
        shotId: 'shot-c',
        patch: { duration: 1500 },
    });

    assert.equal(event, null);
});

test('createSceneShotUpdateEvent rejects unsupported transition metadata before dispatch', () => {
    assert.throws(
        () =>
            createSceneShotUpdateEvent({
                runtimeState: createRuntimeState(),
                shotId: 'shot-a',
                patch: {
                    transitionOut: { type: 'wipe', durationMs: 100 },
                },
            }),
        ShotTransitionValidationError,
    );
});

test('createSceneShotDeleteEvent validates shot membership before dispatch', () => {
    const event = createSceneShotDeleteEvent({
        runtimeState: createRuntimeState(),
        shotId: 'shot-b',
    });

    assert.equal(event?.type, EventTypes.SCENE_SHOT_DELETE);
    assert.equal(event?.payload?.sceneId, 'scene-a');
    assert.equal(event?.payload?.trackId, 'primary');
    assert.equal(event?.payload?.shotId, 'shot-b');
});

test('createShotSetActiveEvent validates the target shot against runtime scene authority', () => {
    const event = createShotSetActiveEvent({
        runtimeState: createRuntimeState(),
        shotId: 'shot-b',
    });

    assert.equal(event?.type, EventTypes.SHOT_SET_ACTIVE);
    assert.deepEqual(event?.payload, { shotId: 'shot-b' });
});

test('createSceneShotMoveEvent infers source track and preserves scene authority', () => {
    const event = createSceneShotMoveEvent({
        runtimeState: createRuntimeState(),
        shotId: 'shot-b',
        toTrackId: 'primary',
        startMs: 1200,
        endMs: 2200,
    });

    assert.equal(event?.type, EventTypes.SCENE_SHOT_MOVE);
    assert.equal(event?.payload?.sceneId, 'scene-a');
    assert.equal(event?.payload?.fromTrackId, 'primary');
    assert.equal(event?.payload?.toTrackId, 'primary');
});
