import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import {
    createSceneShotTrack,
    createSceneShot,
    deleteSceneShotTrack,
    deleteSceneShot,
    moveSceneShot,
    setActiveSceneShot,
    updateSceneShotTrack,
    updateSceneShot,
} from '@/runtime/commands/scene/shotCommands.js';

let registered = false;
let activeDispatcher = null;
let activeRegistrations = 0;

function getRuntimeState() {
    return activeDispatcher?.getState?.() ?? null;
}

function dispatch() {
    return activeDispatcher?.dispatch ?? null;
}

export function registerShotEditorBridge(dispatcher) {
    activeDispatcher = dispatcher ?? null;
    activeRegistrations += 1;

    const onCreate = (payload) =>
        createSceneShot({
            dispatch: dispatch(),
            runtimeState: getRuntimeState(),
            sceneId: payload?.sceneId,
            trackId: payload?.trackId,
            shot: payload?.shot,
        });

    const onCreateTrack = (payload) =>
        createSceneShotTrack({
            dispatch: dispatch(),
            runtimeState: getRuntimeState(),
            sceneId: payload?.sceneId,
            track: payload?.track,
        });

    const onUpdate = (payload) =>
        updateSceneShot({
            dispatch: dispatch(),
            runtimeState: getRuntimeState(),
            sceneId: payload?.sceneId,
            trackId: payload?.trackId,
            shotId: payload?.shotId,
            patch: payload?.patch,
        });

    const onMove = (payload) =>
        moveSceneShot({
            dispatch: dispatch(),
            runtimeState: getRuntimeState(),
            sceneId: payload?.sceneId,
            shotId: payload?.shotId,
            fromTrackId: payload?.fromTrackId,
            toTrackId: payload?.toTrackId,
            startMs: payload?.startMs,
            endMs: payload?.endMs,
        });

    const onUpdateTrack = (payload) =>
        updateSceneShotTrack({
            dispatch: dispatch(),
            runtimeState: getRuntimeState(),
            sceneId: payload?.sceneId,
            trackId: payload?.trackId,
            patch: payload?.patch,
        });

    const onDelete = (payload) =>
        deleteSceneShot({
            dispatch: dispatch(),
            runtimeState: getRuntimeState(),
            sceneId: payload?.sceneId,
            trackId: payload?.trackId,
            shotId: payload?.shotId,
        });

    const onDeleteTrack = (payload) =>
        deleteSceneShotTrack({
            dispatch: dispatch(),
            runtimeState: getRuntimeState(),
            sceneId: payload?.sceneId,
            trackId: payload?.trackId,
        });

    const onSetActive = (payload) =>
        setActiveSceneShot({
            dispatch: dispatch(),
            runtimeState: getRuntimeState(),
            sceneId: payload?.sceneId,
            shotId: payload?.shotId,
        });

    if (!registered) {
        canvasBus.on('intent.scene.shotTrack.create', onCreateTrack);
        canvasBus.on('intent.scene.shotTrack.update', onUpdateTrack);
        canvasBus.on('intent.scene.shotTrack.delete', onDeleteTrack);
        canvasBus.on('intent.scene.shot.create', onCreate);
        canvasBus.on('intent.scene.shot.move', onMove);
        canvasBus.on('intent.scene.shot.update', onUpdate);
        canvasBus.on('intent.scene.shot.delete', onDelete);
        canvasBus.on('intent.scene.shot.setActive', onSetActive);
        canvasBus.on('intent.shot.setActive', onSetActive);
        registered = true;
    }

    return () => {
        activeRegistrations = Math.max(0, activeRegistrations - 1);
        if (activeRegistrations === 0) {
            canvasBus.off('intent.scene.shotTrack.create', onCreateTrack);
            canvasBus.off('intent.scene.shotTrack.update', onUpdateTrack);
            canvasBus.off('intent.scene.shotTrack.delete', onDeleteTrack);
            canvasBus.off('intent.scene.shot.create', onCreate);
            canvasBus.off('intent.scene.shot.move', onMove);
            canvasBus.off('intent.scene.shot.update', onUpdate);
            canvasBus.off('intent.scene.shot.delete', onDelete);
            canvasBus.off('intent.scene.shot.setActive', onSetActive);
            canvasBus.off('intent.shot.setActive', onSetActive);
            activeDispatcher = null;
            registered = false;
        }
    };
}
