import { useMemo } from 'react';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';

const SHOT_EDITOR_EVENTS = Object.freeze({
    createTrack: 'intent.scene.shotTrack.create',
    updateTrack: 'intent.scene.shotTrack.update',
    deleteTrack: 'intent.scene.shotTrack.delete',
    create: 'intent.scene.shot.create',
    move: 'intent.scene.shot.move',
    update: 'intent.scene.shot.update',
    delete: 'intent.scene.shot.delete',
    setActive: 'intent.scene.shot.setActive',
});

function emitIntent(type, payload, validate) {
    if (!validate(payload)) return;
    canvasBus.emit(type, payload);
}

export function shotEditorIntentCreate(payload) {
    emitIntent(
        SHOT_EDITOR_EVENTS.create,
        payload,
        (value) => Boolean(value?.shot?.id),
    );
}

export function shotEditorIntentMove(payload) {
    emitIntent(
        SHOT_EDITOR_EVENTS.move,
        payload,
        (value) =>
            Boolean(value?.shotId) &&
            Boolean(value?.fromTrackId) &&
            Boolean(value?.toTrackId) &&
            Number.isFinite(value?.startMs) &&
            Number.isFinite(value?.endMs),
    );
}

export function shotEditorIntentCreateTrack(payload) {
    emitIntent(
        SHOT_EDITOR_EVENTS.createTrack,
        payload,
        (value) => Boolean(value?.track?.id),
    );
}

export function shotEditorIntentUpdateTrack(payload) {
    emitIntent(
        SHOT_EDITOR_EVENTS.updateTrack,
        payload,
        (value) =>
            Boolean(value?.trackId) &&
            Boolean(value?.patch) &&
            typeof value.patch === 'object' &&
            !Array.isArray(value.patch),
    );
}

export function shotEditorIntentDeleteTrack(payload) {
    emitIntent(
        SHOT_EDITOR_EVENTS.deleteTrack,
        payload,
        (value) => Boolean(value?.trackId),
    );
}

export function shotEditorIntentUpdate(payload) {
    emitIntent(
        SHOT_EDITOR_EVENTS.update,
        payload,
        (value) =>
            Boolean(value?.shotId) &&
            Boolean(value?.patch) &&
            typeof value.patch === 'object' &&
            !Array.isArray(value.patch),
    );
}

export function shotEditorIntentDelete(payload) {
    emitIntent(
        SHOT_EDITOR_EVENTS.delete,
        payload,
        (value) => Boolean(value?.shotId),
    );
}

export function shotEditorIntentSetActive(payload) {
    emitIntent(
        SHOT_EDITOR_EVENTS.setActive,
        payload,
        (value) => Boolean(value?.shotId),
    );
}

export function createShotEditorCommandLayer() {
    const layer = {
        createTrack: shotEditorIntentCreateTrack,
        updateTrack: shotEditorIntentUpdateTrack,
        deleteTrack: shotEditorIntentDeleteTrack,
        create: shotEditorIntentCreate,
        move: shotEditorIntentMove,
        update: shotEditorIntentUpdate,
        delete: shotEditorIntentDelete,
        setActive: shotEditorIntentSetActive,
        createShot: shotEditorIntentCreate,
        moveShot: shotEditorIntentMove,
        updateShot: shotEditorIntentUpdate,
        deleteShot: shotEditorIntentDelete,
        setActiveShot: shotEditorIntentSetActive,
    };
    return Object.freeze(layer);
}

export function useShotEditorIntent() {
    return useMemo(() => createShotEditorCommandLayer(), []);
}
