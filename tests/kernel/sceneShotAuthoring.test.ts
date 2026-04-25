import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import {
    __resetRuntimeStateInternal,
    initialRuntimeState,
} from '@/runtime/state/runtimeState.internal.js';
import { EventTypes } from '@/core/events/eventTypes.js';

function createStateWithSceneShots() {
    const next = structuredClone(initialRuntimeState);
    next.document.sceneGraph = {
        ...next.document.sceneGraph,
        activeSceneId: 'scene-1',
        activeShotId: null,
        scenes: [
            {
                id: 'scene-1',
                name: 'Scene 1',
                duration: 5000,
                shots: [],
            },
        ],
    };
    next.scene.activeSceneId = 'scene-1';
    return next;
}

test.beforeEach(() => {
    __resetRuntimeStateInternal();
});

async function activateAuthoringWorkspace(dispatcher) {
    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: {
                id: 'media',
                policy: {
                    mutation: 'allow',
                    capabilities: ['create', 'mutate', 'delete'],
                },
            },
        },
    });
}

test('dispatcher creates shots with normalized transition metadata', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(createStateWithSceneShots(), { animate: false });
    await activateAuthoringWorkspace(dispatcher);

    const next = await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_CREATE,
        payload: {
            sceneId: 'scene-1',
            shot: {
                id: 'shot-a',
                name: 'Shot A',
                start: 100,
                duration: 300,
                compositionId: 'comp-a',
                transitionOut: { type: 'cut' },
            },
        },
    });

    assert.deepEqual(next.document.sceneGraph.scenes[0].shots[0].transitionOut, {
        type: 'cut',
        durationMs: 0,
    });
    assert.equal(next.document.sceneGraph.activeShotId, 'shot-a');
});

test('dispatcher leaves shot truth unchanged when create payload has invalid transition metadata', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(createStateWithSceneShots(), { animate: false });
    await activateAuthoringWorkspace(dispatcher);

    const next = await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_CREATE,
        payload: {
            sceneId: 'scene-1',
            shot: {
                id: 'shot-a',
                name: 'Shot A',
                start: 0,
                duration: 300,
                compositionId: 'comp-a',
                transitionOut: { type: 'wipe', durationMs: 100 },
            },
        },
    });

    assert.deepEqual(next.document.sceneGraph.scenes[0].shots, []);
    assert.equal(next.document.sceneGraph.activeShotId, null);
});

test('dispatcher updates shots and re-normalizes transition metadata', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(createStateWithSceneShots(), { animate: false });
    await activateAuthoringWorkspace(dispatcher);

    await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_CREATE,
        payload: {
            sceneId: 'scene-1',
            shot: {
                id: 'shot-a',
                name: 'Shot A',
                start: 0,
                duration: 300,
                compositionId: 'comp-a',
                transitionOut: null,
            },
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_UPDATE,
        payload: {
            sceneId: 'scene-1',
            shotId: 'shot-a',
            patch: {
                transitionOut: { type: 'cut' },
            },
        },
    });

    assert.deepEqual(next.document.sceneGraph.scenes[0].shots[0].transitionOut, {
        type: 'cut',
        durationMs: 0,
    });
});

test('dispatcher update reducer infers authoritative scene and owning track from canonical truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(createStateWithSceneShots(), { animate: false });
    await activateAuthoringWorkspace(dispatcher);

    await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_TRACK_CREATE,
        payload: {
            sceneId: 'scene-1',
            track: { id: 'secondary', name: 'Secondary', order: 1, kind: 'shot' },
        },
    });
    await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_CREATE,
        payload: {
            sceneId: 'scene-1',
            trackId: 'secondary',
            shot: { id: 'shot-a', name: 'Shot A', start: 0, duration: 300, compositionId: 'comp-a' },
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_UPDATE,
        payload: {
            shotId: 'shot-a',
            patch: { duration: 450 },
        },
    });

    assert.equal(
        next.document.sceneGraph.scenes[0].shotTracks?.find((track) => track.id === 'secondary')?.shots?.[0]?.duration,
        450,
    );
    assert.deepEqual(next.document.sceneGraph.scenes[0].shots, []);
});

test('dispatcher deletes shots cleanly and repairs active shot', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(createStateWithSceneShots(), { animate: false });
    await activateAuthoringWorkspace(dispatcher);

    await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_CREATE,
        payload: {
            sceneId: 'scene-1',
            shot: { id: 'shot-a', name: 'Shot A', start: 0, duration: 300, compositionId: 'comp-a' },
        },
    });
    await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_CREATE,
        payload: {
            sceneId: 'scene-1',
            shot: { id: 'shot-b', name: 'Shot B', start: 400, duration: 300, compositionId: 'comp-b' },
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_DELETE,
        payload: {
            sceneId: 'scene-1',
            shotId: 'shot-a',
        },
    });

    assert.deepEqual(
        next.document.sceneGraph.scenes[0].shots.map((shot) => shot.id),
        ['shot-b'],
    );
    assert.equal(next.document.sceneGraph.activeShotId, 'shot-b');
});

test('dispatcher delete reducer infers authoritative scene and owning track from canonical truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(createStateWithSceneShots(), { animate: false });
    await activateAuthoringWorkspace(dispatcher);

    await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_TRACK_CREATE,
        payload: {
            sceneId: 'scene-1',
            track: { id: 'secondary', name: 'Secondary', order: 1, kind: 'shot' },
        },
    });
    await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_CREATE,
        payload: {
            sceneId: 'scene-1',
            trackId: 'secondary',
            shot: { id: 'shot-a', name: 'Shot A', start: 0, duration: 300, compositionId: 'comp-a' },
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_DELETE,
        payload: {
            shotId: 'shot-a',
        },
    });

    assert.deepEqual(
        next.document.sceneGraph.scenes[0].shotTracks?.find((track) => track.id === 'secondary')?.shots ?? [],
        [],
    );
    assert.deepEqual(next.document.sceneGraph.scenes[0].shots, []);
});

test('dispatcher stores shots in deterministic order by start then id', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(createStateWithSceneShots(), { animate: false });
    await activateAuthoringWorkspace(dispatcher);

    await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_CREATE,
        payload: {
            sceneId: 'scene-1',
            shot: { id: 'shot-b', name: 'Shot B', start: 500, duration: 0, compositionId: 'comp-b' },
        },
    });
    await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_CREATE,
        payload: {
            sceneId: 'scene-1',
            shot: { id: 'shot-a', name: 'Shot A', start: 100, duration: 200, compositionId: 'comp-a' },
        },
    });
    const next = await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_CREATE,
        payload: {
            sceneId: 'scene-1',
            shot: { id: 'shot-c', name: 'Shot C', start: 500, duration: 0, compositionId: 'comp-c' },
        },
    });

    assert.deepEqual(
        next.document.sceneGraph.scenes[0].shots.map((shot) => shot.id),
        ['shot-a', 'shot-b', 'shot-c'],
    );
});

test('dispatcher create reducer infers authoritative scene and canonical track from runtime truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(createStateWithSceneShots(), { animate: false });
    await activateAuthoringWorkspace(dispatcher);

    await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_TRACK_CREATE,
        payload: {
            sceneId: 'scene-1',
            track: { id: 'secondary', name: 'Secondary', order: 1, kind: 'shot' },
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_CREATE,
        payload: {
            shot: { id: 'shot-a', name: 'Shot A', start: 0, duration: 300, compositionId: 'comp-a' },
        },
    });

    assert.deepEqual(
        next.document.sceneGraph.scenes[0].shotTracks?.find((track) => track.id === 'primary')?.shots?.map((shot) => shot.id),
        ['shot-a'],
    );
    assert.deepEqual(
        next.document.sceneGraph.scenes[0].shotTracks?.find((track) => track.id === 'secondary')?.shots?.map((shot) => shot.id) ?? [],
        [],
    );
});

test('dispatcher creates, updates, and deletes shot tracks deterministically', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(createStateWithSceneShots(), { animate: false });
    await activateAuthoringWorkspace(dispatcher);

    await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_TRACK_CREATE,
        payload: {
            sceneId: 'scene-1',
            track: { id: 'secondary', name: 'Secondary', order: 2, kind: 'shot' },
        },
    });
    const updated = await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_TRACK_UPDATE,
        payload: {
            sceneId: 'scene-1',
            trackId: 'secondary',
            patch: { order: -1, name: 'B Track' },
        },
    });

    assert.deepEqual(
        updated.document.sceneGraph.scenes[0].shotTracks?.map((track) => track.id),
        ['secondary', 'primary'],
    );
    assert.equal(updated.document.sceneGraph.scenes[0].shotTracks?.[0]?.name, 'B Track');

    const deleted = await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_TRACK_DELETE,
        payload: {
            sceneId: 'scene-1',
            trackId: 'secondary',
        },
    });

    assert.deepEqual(
        deleted.document.sceneGraph.scenes[0].shotTracks?.map((track) => track.id),
        ['primary'],
    );
});

test('dispatcher track reducers infer authoritative scene from runtime truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(createStateWithSceneShots(), { animate: false });
    await activateAuthoringWorkspace(dispatcher);

    const created = await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_TRACK_CREATE,
        payload: {
            track: { id: 'secondary', name: 'Secondary', order: 2, kind: 'shot' },
        },
    });

    assert.deepEqual(
        created.document.sceneGraph.scenes[0].shotTracks?.map((track) => track.id),
        ['primary', 'secondary'],
    );

    const updated = await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_TRACK_UPDATE,
        payload: {
            trackId: 'secondary',
            patch: { order: -1, name: 'B Track' },
        },
    });

    assert.deepEqual(
        updated.document.sceneGraph.scenes[0].shotTracks?.map((track) => track.id),
        ['secondary', 'primary'],
    );
    assert.equal(updated.document.sceneGraph.scenes[0].shotTracks?.[0]?.name, 'B Track');

    const deleted = await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_TRACK_DELETE,
        payload: {
            trackId: 'secondary',
        },
    });

    assert.deepEqual(
        deleted.document.sceneGraph.scenes[0].shotTracks?.map((track) => track.id),
        ['primary'],
    );
});

test('dispatcher creates shots inside the requested track and preserves legacy primary shots mirror', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(createStateWithSceneShots(), { animate: false });
    await activateAuthoringWorkspace(dispatcher);

    await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_TRACK_CREATE,
        payload: {
            sceneId: 'scene-1',
            track: { id: 'secondary', name: 'Secondary', order: 1, kind: 'shot' },
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_CREATE,
        payload: {
            sceneId: 'scene-1',
            trackId: 'secondary',
            shot: { id: 'shot-z', name: 'Shot Z', start: 100, duration: 200, compositionId: 'comp-z' },
        },
    });

    assert.deepEqual(
        next.document.sceneGraph.scenes[0].shotTracks?.find((track) => track.id === 'secondary')?.shots.map((shot) => shot.id),
        ['shot-z'],
    );
    assert.deepEqual(next.document.sceneGraph.scenes[0].shots, []);
});

test('dispatcher moves shots within and across tracks without changing identity', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(createStateWithSceneShots(), { animate: false });
    await activateAuthoringWorkspace(dispatcher);

    await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_TRACK_CREATE,
        payload: {
            sceneId: 'scene-1',
            track: { id: 'secondary', name: 'Secondary', order: 1, kind: 'shot' },
        },
    });
    await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_CREATE,
        payload: {
            sceneId: 'scene-1',
            trackId: 'primary',
            shot: { id: 'shot-a', name: 'Shot A', start: 0, duration: 300, compositionId: 'comp-a' },
        },
    });

    const sameTrack = await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_MOVE,
        payload: {
            sceneId: 'scene-1',
            shotId: 'shot-a',
            fromTrackId: 'primary',
            toTrackId: 'primary',
            startMs: 100,
            endMs: 500,
        },
    });

    assert.equal(sameTrack.document.sceneGraph.scenes[0].shotTracks?.[0]?.shots?.[0]?.id, 'shot-a');
    assert.equal(sameTrack.document.sceneGraph.scenes[0].shotTracks?.[0]?.shots?.[0]?.start, 100);
    assert.equal(sameTrack.document.sceneGraph.scenes[0].shotTracks?.[0]?.shots?.[0]?.duration, 400);

    const crossTrack = await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_MOVE,
        payload: {
            sceneId: 'scene-1',
            shotId: 'shot-a',
            fromTrackId: 'primary',
            toTrackId: 'secondary',
            startMs: 200,
            endMs: 600,
        },
    });

    assert.deepEqual(crossTrack.document.sceneGraph.scenes[0].shotTracks?.find((t) => t.id === 'primary')?.shots ?? [], []);
    assert.equal(crossTrack.document.sceneGraph.scenes[0].shotTracks?.find((t) => t.id === 'secondary')?.shots?.[0]?.id, 'shot-a');
    assert.equal(crossTrack.document.sceneGraph.scenes[0].shotTracks?.find((t) => t.id === 'secondary')?.shots?.[0]?.start, 200);
    assert.equal(crossTrack.document.sceneGraph.activeShotId, 'shot-a');
});

test('dispatcher move reducer infers owning track and clamps same-track movement from canonical scene truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(createStateWithSceneShots(), { animate: false });
    await activateAuthoringWorkspace(dispatcher);

    await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_CREATE,
        payload: {
            sceneId: 'scene-1',
            shot: { id: 'shot-a', name: 'Shot A', start: 0, duration: 300, compositionId: 'comp-a' },
        },
    });
    await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_CREATE,
        payload: {
            sceneId: 'scene-1',
            shot: { id: 'shot-b', name: 'Shot B', start: 400, duration: 300, compositionId: 'comp-b' },
        },
    });

    const next = await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_MOVE,
        payload: {
            shotId: 'shot-a',
            startMs: 350,
            endMs: 850,
        },
    });

    assert.deepEqual(
        next.document.sceneGraph.scenes[0].shots.map((shot) => ({
            id: shot.id,
            start: shot.start,
            duration: shot.duration,
        })),
        [
            { id: 'shot-a', start: 0, duration: 400 },
            { id: 'shot-b', start: 400, duration: 300 },
        ],
    );
});

test('dispatcher set-active reducer validates membership from canonical scene truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(createStateWithSceneShots(), { animate: false });
    await activateAuthoringWorkspace(dispatcher);

    await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_CREATE,
        payload: {
            shot: { id: 'shot-a', name: 'Shot A', start: 0, duration: 300, compositionId: 'comp-a' },
        },
    });
    await dispatcher.dispatch({
        type: EventTypes.SCENE_SHOT_CREATE,
        payload: {
            shot: { id: 'shot-b', name: 'Shot B', start: 400, duration: 300, compositionId: 'comp-b' },
        },
    });

    const activated = await dispatcher.dispatch({
        type: EventTypes.SHOT_SET_ACTIVE,
        payload: {
            shotId: 'shot-b',
        },
    });

    assert.equal(activated.document.sceneGraph.activeShotId, 'shot-b');

    const unchanged = await dispatcher.dispatch({
        type: EventTypes.SHOT_SET_ACTIVE,
        payload: {
            shotId: 'shot-missing',
        },
    });

    assert.equal(unchanged.document.sceneGraph.activeShotId, 'shot-b');
});
