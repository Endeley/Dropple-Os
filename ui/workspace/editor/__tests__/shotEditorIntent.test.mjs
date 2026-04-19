import test from 'node:test';
import assert from 'node:assert/strict';

import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import {
    SHOT_EDITOR_INTENTS,
    createShotEditorCommandLayer,
    shotEditorIntentCreateTrack,
    shotEditorIntentCreate,
    shotEditorIntentMove,
    shotEditorIntentDeleteTrack,
    shotEditorIntentDelete,
    shotEditorIntentSetActive,
    shotEditorIntentUpdateTrack,
    shotEditorIntentUpdate,
} from '@/ui/workspace/editor/shotEditorIntent.js';

test('createShotEditorCommandLayer exposes canonical editor command methods and aliases', () => {
    const commands = createShotEditorCommandLayer();

    assert.equal(commands.createTrack, shotEditorIntentCreateTrack);
    assert.equal(commands.updateTrack, shotEditorIntentUpdateTrack);
    assert.equal(commands.deleteTrack, shotEditorIntentDeleteTrack);
    assert.equal(commands.create, shotEditorIntentCreate);
    assert.equal(commands.move, shotEditorIntentMove);
    assert.equal(commands.update, shotEditorIntentUpdate);
    assert.equal(commands.delete, shotEditorIntentDelete);
    assert.equal(commands.setActive, shotEditorIntentSetActive);
    assert.equal(commands.createShot, shotEditorIntentCreate);
    assert.equal(commands.updateShot, shotEditorIntentUpdate);
    assert.equal(commands.deleteShot, shotEditorIntentDelete);
    assert.equal(commands.setActiveShot, shotEditorIntentSetActive);
    assert.ok(Object.isFrozen(commands));
});

test('shot editor command layer emits canonical shot intents on the canvas bus', () => {
    const commands = createShotEditorCommandLayer();
    const received = [];

    const handlers = {
        createTrack: (payload) => received.push(['createTrack', payload]),
        updateTrack: (payload) => received.push(['updateTrack', payload]),
        deleteTrack: (payload) => received.push(['deleteTrack', payload]),
        create: (payload) => received.push(['create', payload]),
        move: (payload) => received.push(['move', payload]),
        update: (payload) => received.push(['update', payload]),
        delete: (payload) => received.push(['delete', payload]),
        setActive: (payload) => received.push(['setActive', payload]),
    };

    canvasBus.on(SHOT_EDITOR_INTENTS.createTrack, handlers.createTrack);
    canvasBus.on(SHOT_EDITOR_INTENTS.updateTrack, handlers.updateTrack);
    canvasBus.on(SHOT_EDITOR_INTENTS.deleteTrack, handlers.deleteTrack);
    canvasBus.on(SHOT_EDITOR_INTENTS.create, handlers.create);
    canvasBus.on(SHOT_EDITOR_INTENTS.move, handlers.move);
    canvasBus.on(SHOT_EDITOR_INTENTS.update, handlers.update);
    canvasBus.on(SHOT_EDITOR_INTENTS.delete, handlers.delete);
    canvasBus.on(SHOT_EDITOR_INTENTS.setActive, handlers.setActive);

    try {
        commands.createTrack({ track: { id: 'track-a' } });
        commands.updateTrack({ trackId: 'track-a', patch: { name: 'Track A' } });
        commands.deleteTrack({ trackId: 'track-a' });
        commands.create({ shot: { id: 'shot-a' } });
        commands.move({ shotId: 'shot-a', fromTrackId: 'primary', toTrackId: 'secondary', startMs: 100, endMs: 400 });
        commands.update({ shotId: 'shot-a', patch: { duration: 1200 } });
        commands.delete({ shotId: 'shot-a' });
        commands.setActive({ shotId: 'shot-a' });
    } finally {
        canvasBus.off(SHOT_EDITOR_INTENTS.createTrack, handlers.createTrack);
        canvasBus.off(SHOT_EDITOR_INTENTS.updateTrack, handlers.updateTrack);
        canvasBus.off(SHOT_EDITOR_INTENTS.deleteTrack, handlers.deleteTrack);
        canvasBus.off(SHOT_EDITOR_INTENTS.create, handlers.create);
        canvasBus.off(SHOT_EDITOR_INTENTS.move, handlers.move);
        canvasBus.off(SHOT_EDITOR_INTENTS.update, handlers.update);
        canvasBus.off(SHOT_EDITOR_INTENTS.delete, handlers.delete);
        canvasBus.off(SHOT_EDITOR_INTENTS.setActive, handlers.setActive);
    }

    assert.deepEqual(received, [
        ['createTrack', { track: { id: 'track-a' } }],
        ['updateTrack', { trackId: 'track-a', patch: { name: 'Track A' } }],
        ['deleteTrack', { trackId: 'track-a' }],
        ['create', { shot: { id: 'shot-a' } }],
        ['move', { shotId: 'shot-a', fromTrackId: 'primary', toTrackId: 'secondary', startMs: 100, endMs: 400 }],
        ['update', { shotId: 'shot-a', patch: { duration: 1200 } }],
        ['delete', { shotId: 'shot-a' }],
        ['setActive', { shotId: 'shot-a' }],
    ]);
});
