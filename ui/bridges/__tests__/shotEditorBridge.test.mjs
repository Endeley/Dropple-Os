import test from 'node:test';
import assert from 'node:assert/strict';

import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { registerShotEditorBridge } from '@/ui/bridges/shotEditorBridge.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { SHOT_EDITOR_INTENTS } from '@/ui/workspace/editor/shotEditorIntent.js';

function createDispatcher(target) {
    return {
        getState() {
            return {
                scene: {
                    activeSceneId: 'scene-a',
                },
                document: {
                    sceneGraph: {
                        activeSceneId: 'scene-a',
                        nodes: {},
                        scenes: [
                            {
                                id: 'scene-a',
                                shots: [
                                    { id: 'shot-a', compositionId: 'comp-a', start: 0, duration: 1000 },
                                    { id: 'shot-b', compositionId: 'comp-b', start: 1000, duration: 1000 },
                                ],
                            },
                        ],
                    },
                },
            };
        },
        dispatch(event) {
            target.push(event);
        },
    };
}

test('shot editor bridge rebinds to the latest dispatcher for create/update/delete intents', () => {
    const staleDispatched = [];
    const dispatched = [];

    const cleanupStale = registerShotEditorBridge(createDispatcher(staleDispatched));
    const cleanupActive = registerShotEditorBridge(createDispatcher(dispatched));

    try {
        canvasBus.emit(SHOT_EDITOR_INTENTS.createTrack, {
            track: { id: 'secondary', order: 1, kind: 'shot' },
        });
        canvasBus.emit(SHOT_EDITOR_INTENTS.updateTrack, {
            trackId: 'secondary',
            patch: { name: 'Secondary' },
        });
        canvasBus.emit(SHOT_EDITOR_INTENTS.deleteTrack, {
            trackId: 'secondary',
        });
        canvasBus.emit(SHOT_EDITOR_INTENTS.create, {
            shot: { id: 'shot-new', compositionId: 'comp-new', start: 2000, duration: 500 },
        });
        canvasBus.emit(SHOT_EDITOR_INTENTS.move, {
            shotId: 'shot-a',
            fromTrackId: 'primary',
            toTrackId: 'primary',
            startMs: 200,
            endMs: 1200,
        });
        canvasBus.emit(SHOT_EDITOR_INTENTS.update, {
            shotId: 'shot-a',
            patch: { duration: 1200 },
        });
        canvasBus.emit(SHOT_EDITOR_INTENTS.delete, {
            shotId: 'shot-b',
        });
    } finally {
        cleanupActive?.();
        cleanupStale?.();
    }

    assert.equal(staleDispatched.length, 0);
    assert.equal(dispatched.length, 7);
    assert.equal(dispatched[0]?.type, EventTypes.SCENE_SHOT_TRACK_CREATE);
    assert.equal(dispatched[1]?.type, EventTypes.SCENE_SHOT_TRACK_UPDATE);
    assert.equal(dispatched[2]?.type, EventTypes.SCENE_SHOT_TRACK_DELETE);
    assert.equal(dispatched[3]?.type, EventTypes.SCENE_SHOT_CREATE);
    assert.equal(dispatched[4]?.type, EventTypes.SCENE_SHOT_MOVE);
    assert.equal(dispatched[5]?.type, EventTypes.SCENE_SHOT_UPDATE);
    assert.equal(dispatched[6]?.type, EventTypes.SCENE_SHOT_DELETE);
});

test('shot editor bridge listens only to the canonical set-active intent', () => {
    const dispatched = [];
    const cleanup = registerShotEditorBridge(createDispatcher(dispatched));

    try {
        canvasBus.emit(SHOT_EDITOR_INTENTS.setActive, { shotId: 'shot-a' });
        canvasBus.emit('intent.shot.setActive', { shotId: 'shot-b' });
    } finally {
        cleanup?.();
    }

    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, EventTypes.SHOT_SET_ACTIVE);
    assert.equal(dispatched[0]?.payload?.shotId, 'shot-a');
});
