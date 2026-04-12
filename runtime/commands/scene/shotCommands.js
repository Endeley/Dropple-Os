import { EventTypes } from '@/core/events/eventTypes.js';
import { getSceneGraph } from '@/runtime/document/documentAdapter.js';
import { PRIMARY_SHOT_TRACK_ID, findSceneShot, getCanonicalShotTrack, getSceneShotTracks } from '@/core/scene/shotTracks.js';
import { clampShotMoveWithinTrack } from '@/runtime/interaction/shotTrackOverlapPolicy.js';
import { normalizeTransitionOut } from '@/core/project/normalizeShotTransitionOut.js';

function resolveSceneId(runtimeState, sceneId) {
    const runtimeSceneId =
        runtimeState?.scene?.activeSceneId ?? getSceneGraph(runtimeState)?.activeSceneId ?? null;
    return runtimeSceneId ?? sceneId ?? null;
}

function resolveScene(runtimeState, sceneId) {
    const graph = getSceneGraph(runtimeState);
    if (!graph || !Array.isArray(graph.scenes) || !sceneId) return null;
    return graph.scenes.find((scene) => scene?.id === sceneId) ?? null;
}

function resolveShot(scene, shotId) {
    return findSceneShot(scene, shotId);
}

function resolveTrackId(scene, trackId) {
    if (trackId) return trackId;
    return getCanonicalShotTrack(scene)?.id ?? PRIMARY_SHOT_TRACK_ID;
}

function resolveTrack(scene, trackId) {
    return getSceneShotTracks(scene).find((track) => track?.id === trackId) ?? null;
}

export function createSceneShotTrackCreateEvent({ runtimeState, sceneId, track } = {}) {
    const resolvedSceneId = resolveSceneId(runtimeState, sceneId);
    if (!resolvedSceneId || !track?.id) return null;

    if (runtimeState) {
        const scene = resolveScene(runtimeState, resolvedSceneId);
        if (!scene) return null;
        if (resolveTrack(scene, track.id)) return null;
    }

    return {
        type: EventTypes.SCENE_SHOT_TRACK_CREATE,
        payload: {
            sceneId: resolvedSceneId,
            track,
        },
    };
}

export function createSceneShotTrackUpdateEvent({ runtimeState, sceneId, trackId, patch } = {}) {
    const resolvedSceneId = resolveSceneId(runtimeState, sceneId);
    if (!resolvedSceneId || !trackId || !hasPatch(patch)) return null;

    if (runtimeState) {
        const scene = resolveScene(runtimeState, resolvedSceneId);
        if (!resolveTrack(scene, trackId)) return null;
    }

    return {
        type: EventTypes.SCENE_SHOT_TRACK_UPDATE,
        payload: {
            sceneId: resolvedSceneId,
            trackId,
            patch,
        },
    };
}

export function createSceneShotTrackDeleteEvent({ runtimeState, sceneId, trackId } = {}) {
    const resolvedSceneId = resolveSceneId(runtimeState, sceneId);
    if (!resolvedSceneId || !trackId) return null;

    if (runtimeState) {
        const scene = resolveScene(runtimeState, resolvedSceneId);
        if (!resolveTrack(scene, trackId)) return null;
    }

    return {
        type: EventTypes.SCENE_SHOT_TRACK_DELETE,
        payload: {
            sceneId: resolvedSceneId,
            trackId,
        },
    };
}

function hasPatch(patch) {
    return Boolean(patch) && typeof patch === 'object' && !Array.isArray(patch);
}

function hasTransitionOutKey(input) {
    return Boolean(input) && typeof input === 'object' && Object.prototype.hasOwnProperty.call(input, 'transitionOut');
}

function validateShotTransitionOutAtCommandBoundary(input) {
    if (!hasTransitionOutKey(input)) return true;
    normalizeTransitionOut(input.transitionOut);
    return true;
}

export function createSceneShotCreateEvent({ runtimeState, sceneId, trackId, shot } = {}) {
    const resolvedSceneId = resolveSceneId(runtimeState, sceneId);
    if (!resolvedSceneId || !shot?.id) return null;
    validateShotTransitionOutAtCommandBoundary(shot);

    if (runtimeState) {
        const scene = resolveScene(runtimeState, resolvedSceneId);
        if (!scene) return null;
        const resolvedTrackId = resolveTrackId(scene, trackId);
        if (!resolveTrack(scene, resolvedTrackId)) return null;
        if (resolveShot(scene, shot.id)) return null;
        trackId = resolvedTrackId;
    }

    return {
        type: EventTypes.SCENE_SHOT_CREATE,
        payload: {
            sceneId: resolvedSceneId,
            trackId,
            shot,
        },
    };
}

export function createSceneShotUpdateEvent({ runtimeState, sceneId, trackId, shotId, patch } = {}) {
    const resolvedSceneId = resolveSceneId(runtimeState, sceneId);
    if (!resolvedSceneId || !shotId || !hasPatch(patch)) return null;
    validateShotTransitionOutAtCommandBoundary(patch);

    if (runtimeState) {
        const scene = resolveScene(runtimeState, resolvedSceneId);
        const resolved = resolveShot(scene, shotId);
        if (!resolved) return null;
        trackId = trackId ?? resolved.trackId;
    }

    return {
        type: EventTypes.SCENE_SHOT_UPDATE,
        payload: {
            sceneId: resolvedSceneId,
            trackId,
            shotId,
            patch,
        },
    };
}

export function createSceneShotDeleteEvent({ runtimeState, sceneId, trackId, shotId } = {}) {
    const resolvedSceneId = resolveSceneId(runtimeState, sceneId);
    if (!resolvedSceneId || !shotId) return null;

    if (runtimeState) {
        const scene = resolveScene(runtimeState, resolvedSceneId);
        const resolved = resolveShot(scene, shotId);
        if (!resolved) return null;
        trackId = trackId ?? resolved.trackId;
    }

    return {
        type: EventTypes.SCENE_SHOT_DELETE,
        payload: {
            sceneId: resolvedSceneId,
            trackId,
            shotId,
        },
    };
}

export function createSceneShotMoveEvent({
    runtimeState,
    sceneId,
    shotId,
    fromTrackId,
    toTrackId,
    startMs,
    endMs,
} = {}) {
    const resolvedSceneId = resolveSceneId(runtimeState, sceneId);
    if (
        !resolvedSceneId ||
        !shotId ||
        !Number.isFinite(startMs) ||
        !Number.isFinite(endMs) ||
        endMs < startMs
    ) {
        return null;
    }

    if (runtimeState) {
        const scene = resolveScene(runtimeState, resolvedSceneId);
        const resolved = resolveShot(scene, shotId);
        if (!resolved) return null;
        fromTrackId = fromTrackId ?? resolved.trackId;
        toTrackId = toTrackId ?? fromTrackId;
        if (!resolveTrack(scene, fromTrackId) || !resolveTrack(scene, toTrackId)) return null;
        if (fromTrackId === toTrackId) {
            const clamped = clampShotMoveWithinTrack({
                shots: resolveTrack(scene, toTrackId)?.shots ?? [],
                shotId,
                startMs,
                endMs,
            });
            startMs = clamped.startMs;
            endMs = clamped.endMs;
        }
    }

    return {
        type: EventTypes.SCENE_SHOT_MOVE,
        payload: {
            sceneId: resolvedSceneId,
            shotId,
            fromTrackId,
            toTrackId,
            startMs,
            endMs,
        },
    };
}

export function createShotSetActiveEvent({ runtimeState, sceneId, shotId } = {}) {
    const resolvedSceneId = resolveSceneId(runtimeState, sceneId);
    if (!shotId) return null;

    if (runtimeState) {
        const scene = resolveScene(runtimeState, resolvedSceneId);
        if (!resolveShot(scene, shotId)) return null;
    }

    return {
        type: EventTypes.SHOT_SET_ACTIVE,
        payload: {
            shotId,
        },
    };
}

function dispatchSceneShotEvent(dispatch, event) {
    if (typeof dispatch !== 'function' || !event) return null;
    return dispatch(event);
}

export function createSceneShot({ dispatch, runtimeState, sceneId, trackId, shot } = {}) {
    return dispatchSceneShotEvent(
        dispatch,
        createSceneShotCreateEvent({ runtimeState, sceneId, trackId, shot }),
    );
}

export function createSceneShotTrack({ dispatch, runtimeState, sceneId, track } = {}) {
    return dispatchSceneShotEvent(
        dispatch,
        createSceneShotTrackCreateEvent({ runtimeState, sceneId, track }),
    );
}

export function updateSceneShotTrack({ dispatch, runtimeState, sceneId, trackId, patch } = {}) {
    return dispatchSceneShotEvent(
        dispatch,
        createSceneShotTrackUpdateEvent({ runtimeState, sceneId, trackId, patch }),
    );
}

export function deleteSceneShotTrack({ dispatch, runtimeState, sceneId, trackId } = {}) {
    return dispatchSceneShotEvent(
        dispatch,
        createSceneShotTrackDeleteEvent({ runtimeState, sceneId, trackId }),
    );
}

export function moveSceneShot({
    dispatch,
    runtimeState,
    sceneId,
    shotId,
    fromTrackId,
    toTrackId,
    startMs,
    endMs,
} = {}) {
    return dispatchSceneShotEvent(
        dispatch,
        createSceneShotMoveEvent({
            runtimeState,
            sceneId,
            shotId,
            fromTrackId,
            toTrackId,
            startMs,
            endMs,
        }),
    );
}

export function updateSceneShot({ dispatch, runtimeState, sceneId, trackId, shotId, patch } = {}) {
    return dispatchSceneShotEvent(
        dispatch,
        createSceneShotUpdateEvent({ runtimeState, sceneId, trackId, shotId, patch }),
    );
}

export function deleteSceneShot({ dispatch, runtimeState, sceneId, trackId, shotId } = {}) {
    return dispatchSceneShotEvent(
        dispatch,
        createSceneShotDeleteEvent({ runtimeState, sceneId, trackId, shotId }),
    );
}

export function setActiveSceneShot({ dispatch, runtimeState, sceneId, shotId } = {}) {
    return dispatchSceneShotEvent(
        dispatch,
        createShotSetActiveEvent({ runtimeState, sceneId, shotId }),
    );
}
