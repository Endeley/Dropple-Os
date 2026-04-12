import { EventTypes } from '../eventTypes.js';
import { normalizeShotTransitionOut } from '@/core/project/normalizeShotTransitionOut.js';
import {
    PRIMARY_SHOT_TRACK_ID,
    findSceneShot,
    getCanonicalShotTrack,
    getSceneShotTracks,
    normalizeSceneShotTracks,
    sortShots,
    sortShotTracks,
} from '@/core/scene/shotTracks.js';

function getSceneGraph(state) {
    return state?.document?.sceneGraph ?? null;
}

function updateSceneGraph(state, sceneGraph) {
    return {
        ...state,
        document: {
            ...state.document,
            sceneGraph,
        },
    };
}

function materializeScene(scene, shotTracks) {
    const nextScene = normalizeSceneShotTracks({
        ...scene,
        shotTracks,
    });
    return nextScene;
}

function updateSceneTracks(sceneGraph, sceneId, updater) {
    if (!sceneGraph || !Array.isArray(sceneGraph.scenes)) return null;

    let changed = false;
    const scenes = sceneGraph.scenes.map((scene) => {
        if (scene?.id !== sceneId) return scene;
        const nextTracks = updater(getSceneShotTracks(scene), scene);
        if (!nextTracks) return scene;
        const sortedTracks = sortShotTracks(nextTracks);
        const currentTracks = getSceneShotTracks(scene);
        if (sortedTracks === currentTracks) return scene;
        changed = true;
        return materializeScene(scene, sortedTracks);
    });

    if (!changed) return null;
    return {
        ...sceneGraph,
        scenes,
    };
}

function normalizeCreatedShot(shot) {
    if (!shot?.id) return null;

    return normalizeShotTransitionOut({
        name: '',
        start: 0,
        duration: 0,
        compositionId: null,
        camera: undefined,
        audioTracks: undefined,
        ...shot,
    });
}

export function sceneShotReducers(state, event) {
    const { type, payload } = event;
    const sceneGraph = getSceneGraph(state);

    switch (type) {
        case EventTypes.SCENE_SHOT_TRACK_CREATE: {
            const sceneId = payload?.sceneId;
            const track = payload?.track;
            if (!sceneId || !track?.id) return state;

            const nextSceneGraph = updateSceneTracks(sceneGraph, sceneId, (tracks) => {
                if (tracks.some((entry) => entry?.id === track.id)) return tracks;
                return [
                    ...tracks,
                    {
                        id: track.id,
                        name: track.name ?? '',
                        order: Number.isFinite(track.order) ? track.order : tracks.length,
                        kind: track.kind ?? 'shot',
                        shots: [],
                    },
                ];
            });
            return nextSceneGraph ? updateSceneGraph(state, nextSceneGraph) : state;
        }

        case EventTypes.SCENE_SHOT_TRACK_UPDATE: {
            const sceneId = payload?.sceneId;
            const trackId = payload?.trackId;
            const patch = payload?.patch;
            if (!sceneId || !trackId || !patch || typeof patch !== 'object') return state;

            const nextSceneGraph = updateSceneTracks(sceneGraph, sceneId, (tracks) => {
                let changed = false;
                const nextTracks = tracks.map((track) => {
                    if (track?.id !== trackId) return track;
                    changed = true;
                    return {
                        ...track,
                        ...patch,
                        shots: sortShots(Array.isArray(track.shots) ? track.shots : []),
                    };
                });
                return changed ? nextTracks : tracks;
            });
            return nextSceneGraph ? updateSceneGraph(state, nextSceneGraph) : state;
        }

        case EventTypes.SCENE_SHOT_TRACK_DELETE: {
            const sceneId = payload?.sceneId;
            const trackId = payload?.trackId;
            if (!sceneId || !trackId) return state;

            const nextSceneGraph = updateSceneTracks(sceneGraph, sceneId, (tracks) => {
                const nextTracks = tracks.filter((track) => track?.id !== trackId);
                return nextTracks.length === tracks.length ? tracks : nextTracks;
            });
            if (!nextSceneGraph) return state;

            const scene = nextSceneGraph.scenes.find((entry) => entry?.id === sceneId) ?? null;
            const nextActiveShotId = sceneGraph?.activeShotId
                ? findSceneShot(scene, sceneGraph.activeShotId)?.shot?.id ?? null
                : null;

            return updateSceneGraph(state, {
                ...nextSceneGraph,
                activeShotId: nextActiveShotId,
            });
        }

        case EventTypes.SCENE_SHOT_CREATE: {
            const sceneId = payload?.sceneId;
            const trackId = payload?.trackId ?? PRIMARY_SHOT_TRACK_ID;
            const shot = normalizeCreatedShot(payload?.shot);
            if (!sceneId || !trackId || !shot?.id) return state;

            const nextSceneGraph = updateSceneTracks(sceneGraph, sceneId, (tracks) => {
                let changed = false;
                const nextTracks = tracks.map((track) => {
                    if (track?.id !== trackId) return track;
                    if (track.shots.some((entry) => entry?.id === shot.id)) return track;
                    changed = true;
                    return {
                        ...track,
                        shots: sortShots([...track.shots, shot]),
                    };
                });
                return changed ? nextTracks : tracks;
            });
            if (!nextSceneGraph) return state;

            const nextState = updateSceneGraph(state, nextSceneGraph);
            if (nextSceneGraph.activeShotId != null) return nextState;
            return updateSceneGraph(nextState, {
                ...nextSceneGraph,
                activeShotId: shot.id,
            });
        }

        case EventTypes.SCENE_SHOT_MOVE: {
            const sceneId = payload?.sceneId;
            const shotId = payload?.shotId;
            const fromTrackId = payload?.fromTrackId;
            const toTrackId = payload?.toTrackId;
            const startMs = payload?.startMs;
            const endMs = payload?.endMs;
            if (
                !sceneId ||
                !shotId ||
                !fromTrackId ||
                !toTrackId ||
                !Number.isFinite(startMs) ||
                !Number.isFinite(endMs) ||
                endMs < startMs
            ) {
                return state;
            }

            const nextSceneGraph = updateSceneTracks(sceneGraph, sceneId, (tracks) => {
                const sourceTrack = tracks.find((track) => track?.id === fromTrackId) ?? null;
                const targetTrack = tracks.find((track) => track?.id === toTrackId) ?? null;
                const shot = sourceTrack?.shots?.find((entry) => entry?.id === shotId) ?? null;
                if (!sourceTrack || !targetTrack || !shot) return tracks;

                const movedShot = normalizeShotTransitionOut({
                    ...shot,
                    start: Number(startMs),
                    duration: Math.max(0, Number(endMs) - Number(startMs)),
                });

                if (fromTrackId === toTrackId) {
                    let changed = false;
                    const nextTracks = tracks.map((track) => {
                        if (track?.id !== fromTrackId) return track;
                        changed = true;
                        return {
                            ...track,
                            shots: sortShots(
                                track.shots.map((entry) => (entry?.id === shotId ? movedShot : entry)),
                            ),
                        };
                    });
                    return changed ? nextTracks : tracks;
                }

                const nextTracks = tracks.map((track) => {
                    if (track?.id === fromTrackId) {
                        return {
                            ...track,
                            shots: sortShots(track.shots.filter((entry) => entry?.id !== shotId)),
                        };
                    }
                    if (track?.id === toTrackId) {
                        return {
                            ...track,
                            shots: sortShots([...track.shots, movedShot]),
                        };
                    }
                    return track;
                });

                return nextTracks;
            });

            return nextSceneGraph ? updateSceneGraph(state, nextSceneGraph) : state;
        }

        case EventTypes.SCENE_SHOT_UPDATE: {
            const sceneId = payload?.sceneId;
            const trackId = payload?.trackId ?? PRIMARY_SHOT_TRACK_ID;
            const shotId = payload?.shotId;
            const patch = payload?.patch;
            if (!sceneId || !trackId || !shotId || !patch || typeof patch !== 'object') return state;

            const nextSceneGraph = updateSceneTracks(sceneGraph, sceneId, (tracks) => {
                let changed = false;
                const nextTracks = tracks.map((track) => {
                    if (track?.id !== trackId) return track;
                    const nextShots = track.shots.map((shot) => {
                        if (shot?.id !== shotId) return shot;
                        changed = true;
                        return normalizeShotTransitionOut({
                            ...shot,
                            ...patch,
                        });
                    });
                    return changed
                        ? {
                              ...track,
                              shots: sortShots(nextShots),
                          }
                        : track;
                });
                return changed ? nextTracks : tracks;
            });
            return nextSceneGraph ? updateSceneGraph(state, nextSceneGraph) : state;
        }

        case EventTypes.SCENE_SHOT_DELETE: {
            const sceneId = payload?.sceneId;
            const trackId = payload?.trackId ?? PRIMARY_SHOT_TRACK_ID;
            const shotId = payload?.shotId;
            if (!sceneId || !trackId || !shotId) return state;

            const nextSceneGraph = updateSceneTracks(sceneGraph, sceneId, (tracks) => {
                let changed = false;
                const nextTracks = tracks.map((track) => {
                    if (track?.id !== trackId) return track;
                    const nextShots = track.shots.filter((shot) => shot?.id !== shotId);
                    if (nextShots.length === track.shots.length) return track;
                    changed = true;
                    return {
                        ...track,
                        shots: sortShots(nextShots),
                    };
                });
                return changed ? nextTracks : tracks;
            });
            if (!nextSceneGraph) return state;

            const scene = nextSceneGraph.scenes.find((entry) => entry?.id === sceneId) ?? null;
            const nextActiveShotId =
                nextSceneGraph.activeShotId === shotId
                    ? getCanonicalShotTrack(scene)?.shots?.[0]?.id ?? null
                    : nextSceneGraph.activeShotId ?? null;

            return updateSceneGraph(state, {
                ...nextSceneGraph,
                activeShotId: nextActiveShotId,
            });
        }

        default:
            return state;
    }
}
