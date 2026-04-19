import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { SHOT_EDITOR_INTENTS } from '@/ui/workspace/editor/shotEditorIntent.js';
import { EventTypes } from '@/core/events/eventTypes.js';

let registered = false;
let activeDispatcher = null;
let activeRegistrations = 0;

function dispatch() {
    return activeDispatcher?.dispatch ?? null;
}

export function registerShotEditorBridge(dispatcher) {
    activeDispatcher = dispatcher ?? null;
    activeRegistrations += 1;

    const onCreate = (payload) =>
        dispatch()?.({
            type: EventTypes.SCENE_SHOT_CREATE,
            payload: {
                sceneId: payload?.sceneId,
                trackId: payload?.trackId,
                shot: payload?.shot,
            },
        });

    const onCreateTrack = (payload) =>
        dispatch()?.({
            type: EventTypes.SCENE_SHOT_TRACK_CREATE,
            payload: {
                sceneId: payload?.sceneId,
                track: payload?.track,
            },
        });

    const onUpdate = (payload) =>
        dispatch()?.({
            type: EventTypes.SCENE_SHOT_UPDATE,
            payload: {
                sceneId: payload?.sceneId,
                trackId: payload?.trackId,
                shotId: payload?.shotId,
                patch: payload?.patch,
            },
        });

    const onMove = (payload) =>
        dispatch()?.({
            type: EventTypes.SCENE_SHOT_MOVE,
            payload: {
                sceneId: payload?.sceneId,
                shotId: payload?.shotId,
                fromTrackId: payload?.fromTrackId,
                toTrackId: payload?.toTrackId,
                startMs: payload?.startMs,
                endMs: payload?.endMs,
            },
        });

    const onUpdateTrack = (payload) =>
        dispatch()?.({
            type: EventTypes.SCENE_SHOT_TRACK_UPDATE,
            payload: {
                sceneId: payload?.sceneId,
                trackId: payload?.trackId,
                patch: payload?.patch,
            },
        });

    const onDelete = (payload) =>
        dispatch()?.({
            type: EventTypes.SCENE_SHOT_DELETE,
            payload: {
                sceneId: payload?.sceneId,
                trackId: payload?.trackId,
                shotId: payload?.shotId,
            },
        });

    const onDeleteTrack = (payload) =>
        dispatch()?.({
            type: EventTypes.SCENE_SHOT_TRACK_DELETE,
            payload: {
                sceneId: payload?.sceneId,
                trackId: payload?.trackId,
            },
        });

    const onSetActive = (payload) =>
        dispatch()?.({
            type: EventTypes.SHOT_SET_ACTIVE,
            payload: {
                sceneId: payload?.sceneId,
                shotId: payload?.shotId,
            },
        });

    if (!registered) {
        canvasBus.on(SHOT_EDITOR_INTENTS.createTrack, onCreateTrack);
        canvasBus.on(SHOT_EDITOR_INTENTS.updateTrack, onUpdateTrack);
        canvasBus.on(SHOT_EDITOR_INTENTS.deleteTrack, onDeleteTrack);
        canvasBus.on(SHOT_EDITOR_INTENTS.create, onCreate);
        canvasBus.on(SHOT_EDITOR_INTENTS.move, onMove);
        canvasBus.on(SHOT_EDITOR_INTENTS.update, onUpdate);
        canvasBus.on(SHOT_EDITOR_INTENTS.delete, onDelete);
        canvasBus.on(SHOT_EDITOR_INTENTS.setActive, onSetActive);
        registered = true;
    }

    return () => {
        activeRegistrations = Math.max(0, activeRegistrations - 1);
        if (activeRegistrations === 0) {
            canvasBus.off(SHOT_EDITOR_INTENTS.createTrack, onCreateTrack);
            canvasBus.off(SHOT_EDITOR_INTENTS.updateTrack, onUpdateTrack);
            canvasBus.off(SHOT_EDITOR_INTENTS.deleteTrack, onDeleteTrack);
            canvasBus.off(SHOT_EDITOR_INTENTS.create, onCreate);
            canvasBus.off(SHOT_EDITOR_INTENTS.move, onMove);
            canvasBus.off(SHOT_EDITOR_INTENTS.update, onUpdate);
            canvasBus.off(SHOT_EDITOR_INTENTS.delete, onDelete);
            canvasBus.off(SHOT_EDITOR_INTENTS.setActive, onSetActive);
            activeDispatcher = null;
            registered = false;
        }
    };
}
