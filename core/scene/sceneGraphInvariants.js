import { findSceneShot, getSceneShots } from './shotTracks.js';

function safeNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function getScenes(sceneGraph) {
    return Array.isArray(sceneGraph?.scenes) ? sceneGraph.scenes.filter(Boolean) : [];
}

export function getSceneById(sceneGraph, sceneId) {
    if (!sceneId) return null;
    return getScenes(sceneGraph).find((scene) => scene?.id === sceneId) ?? null;
}

export function resolveCanonicalSceneSelection({
    sceneGraph,
    preferredSceneId = null,
    preferredShotId = null,
} = {}) {
    const scenes = getScenes(sceneGraph);
    const resolvedScene =
        getSceneById(sceneGraph, preferredSceneId) ??
        getSceneById(sceneGraph, sceneGraph?.activeSceneId ?? null) ??
        scenes[0] ??
        null;
    const resolvedSceneId = resolvedScene?.id ?? null;

    if (!resolvedScene) {
        return {
            activeSceneId: null,
            activeShotId: null,
        };
    }

    const resolvedShotId =
        (preferredShotId && findSceneShot(resolvedScene, preferredShotId)?.shot?.id) ??
        (sceneGraph?.activeShotId &&
            findSceneShot(resolvedScene, sceneGraph.activeShotId)?.shot?.id) ??
        getSceneShots(resolvedScene)[0]?.id ??
        null;

    return {
        activeSceneId: resolvedSceneId,
        activeShotId: resolvedShotId,
    };
}

export function assertCanonicalShotSequence(shots = [], { sceneId = 'unknown' } = {}) {
    let previousEnd = -Infinity;

    for (const shot of Array.isArray(shots) ? shots : []) {
        if (!shot) continue;

        const shotId = shot?.id ?? 'unknown';
        const start = safeNumber(shot?.startMs ?? shot?.start);
        const duration = safeNumber(shot?.durationMs ?? shot?.duration);
        const end = Number.isFinite(shot?.endMs) ? Number(shot.endMs) : start + duration;

        if (start < previousEnd) {
            throw new Error(
                `sceneGraph: shots must not overlap (${sceneId}:${shotId})`
            );
        }

        previousEnd = end;
    }
}

export function assertSceneGraphInvariants({
    sceneGraph,
    compositions = null,
    activeSceneId = null,
    activeShotId = null,
    requireActiveShot = false,
} = {}) {
    const scene = getSceneById(sceneGraph, activeSceneId);

    if (activeSceneId && !scene) {
        throw new Error(`sceneGraph: activeSceneId not found (${activeSceneId})`);
    }

    if (!scene) return null;

    const shots = getSceneShots(scene);
    assertCanonicalShotSequence(shots, { sceneId: scene.id });

    let lastShotEnd = 0;
    for (const shot of shots) {
        if (!shot) continue;

        const shotId = shot?.id ?? 'unknown';
        const start = safeNumber(shot?.start);
        const duration = safeNumber(shot?.duration);
        const end = start + duration;

        if (compositions && (!shot?.compositionId || !compositions[shot.compositionId])) {
            throw new Error(
                `sceneGraph: shot compositionId must exist in project.compositions (${scene.id}:${shotId})`
            );
        }

        const keyframes = Array.isArray(shot?.camera?.keyframes) ? shot.camera.keyframes : [];
        for (const keyframe of keyframes) {
            const time = safeNumber(keyframe?.time, -1);
            if (time < 0 || time > duration) {
                throw new Error(
                    `sceneGraph: camera keyframes must be within shot duration (${scene.id}:${shotId})`
                );
            }
        }

        lastShotEnd = Math.max(lastShotEnd, end);
    }

    if (Number.isFinite(scene?.duration) && Number(scene.duration) < lastShotEnd) {
        throw new Error(
            `sceneGraph: scene.duration must be >= last shot end (${scene.id})`
        );
    }

    if (activeShotId != null && !findSceneShot(scene, activeShotId)) {
        throw new Error(
            `sceneGraph: activeShotId must belong to activeSceneId (${scene.id}:${activeShotId})`
        );
    }

    if (requireActiveShot && shots.length > 0 && activeShotId == null) {
        throw new Error(
            `sceneGraph: activeShotId must not be null when scene has shots (${scene.id})`
        );
    }

    return scene;
}
