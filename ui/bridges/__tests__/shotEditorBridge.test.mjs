import test from 'node:test';
import assert from 'node:assert/strict';

import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { registerShotEditorBridge } from '@/ui/bridges/shotEditorBridge.js';
import { EventTypes } from '@/core/events/eventTypes.js';

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
        canvasBus.emit('intent.scene.shotTrack.create', {
            track: { id: 'secondary', order: 1, kind: 'shot' },
        });
        canvasBus.emit('intent.scene.shot.create', {
            shot: { id: 'shot-new', compositionId: 'comp-new', start: 2000, duration: 500 },
        });
        canvasBus.emit('intent.scene.shot.move', {
            shotId: 'shot-a',
            fromTrackId: 'primary',
            toTrackId: 'primary',
            startMs: 200,
            endMs: 1200,
        });
        canvasBus.emit('intent.scene.shot.update', {
            shotId: 'shot-a',
            patch: { duration: 1200 },
        });
        canvasBus.emit('intent.scene.shot.delete', {
            shotId: 'shot-b',
        });
    } finally {
        cleanupActive?.();
        cleanupStale?.();
    }

    assert.equal(staleDispatched.length, 0);
    assert.equal(dispatched.length, 5);
    assert.equal(dispatched[0]?.type, EventTypes.SCENE_SHOT_TRACK_CREATE);
    assert.equal(dispatched[1]?.type, EventTypes.SCENE_SHOT_CREATE);
    assert.equal(dispatched[2]?.type, EventTypes.SCENE_SHOT_MOVE);
    assert.equal(dispatched[3]?.type, EventTypes.SCENE_SHOT_UPDATE);
    assert.equal(dispatched[4]?.type, EventTypes.SCENE_SHOT_DELETE);
});

test('shot editor bridge supports both legacy and canonical set-active intents', () => {
    const dispatched = [];
    const cleanup = registerShotEditorBridge(createDispatcher(dispatched));

    try {
        canvasBus.emit('intent.scene.shot.setActive', { shotId: 'shot-a' });
        canvasBus.emit('intent.shot.setActive', { shotId: 'shot-b' });
    } finally {
        cleanup?.();
    }

    assert.equal(dispatched.length, 2);
    assert.equal(dispatched[0]?.type, EventTypes.SHOT_SET_ACTIVE);
    assert.equal(dispatched[0]?.payload?.shotId, 'shot-a');
    assert.equal(dispatched[1]?.type, EventTypes.SHOT_SET_ACTIVE);
    assert.equal(dispatched[1]?.payload?.shotId, 'shot-b');
});
