import { findSceneShot, getSceneShots, getSceneShotTracks } from '@/core/scene/shotTracks.js';

export function selectSceneGraph(project) {
    return project?.sceneGraph ?? null;
}

export function selectActiveScene(project) {
    const graph = selectSceneGraph(project);
    if (!graph || !graph.activeSceneId) return null;

    return graph.scenes.find((scene) => scene.id === graph.activeSceneId) ?? null;
}

export function selectSceneById(project, sceneId) {
    const graph = selectSceneGraph(project);
    if (!graph || !sceneId) return null;

    return graph.scenes.find((scene) => scene.id === sceneId) ?? null;
}

export function selectShots(scene) {
    return getSceneShots(scene);
}

export function selectShotTracks(scene) {
    return getSceneShotTracks(scene);
}

export function selectActiveShot(project) {
    const graph = project?.sceneGraph;
    if (!graph || !graph.activeSceneId || !graph.activeShotId) return null;

    const scene = graph.scenes.find((item) => item.id === graph.activeSceneId);
    if (!scene) return null;

    return findSceneShot(scene, graph.activeShotId)?.shot ?? null;
}

export function selectCompositionForShot(project, shot) {
    if (!shot) return null;
    return project?.compositions?.[shot.compositionId] ?? null;
}

export function selectShotEnd(shot) {
    if (!shot) return null;
    return shot.start + shot.duration;
}
