import type { ProjectV2 } from '../contracts/project.v2';
import type { SceneGraphV1, SceneV1, ShotV1 } from '../contracts/sceneGraph.v1';

export function selectSceneGraph(project: ProjectV2 | null | undefined): SceneGraphV1 | null {
    return project?.sceneGraph ?? null;
}

export function selectActiveScene(project: ProjectV2 | null | undefined): SceneV1 | null {
    const graph = selectSceneGraph(project);
    if (!graph || !graph.activeSceneId) return null;

    return graph.scenes.find((scene) => scene.id === graph.activeSceneId) ?? null;
}

export function selectSceneById(
    project: ProjectV2 | null | undefined,
    sceneId: string | null | undefined,
): SceneV1 | null {
    const graph = selectSceneGraph(project);
    if (!graph || !sceneId) return null;

    return graph.scenes.find((scene) => scene.id === sceneId) ?? null;
}

export function selectShots(scene: SceneV1 | null | undefined): ShotV1[] {
    return scene?.shots ?? [];
}

export function selectActiveShot(project: ProjectV2 | null | undefined): ShotV1 | null {
    const graph = project?.sceneGraph;
    if (!graph || !graph.activeSceneId || !graph.activeShotId) return null;

    const scene = graph.scenes.find((item) => item.id === graph.activeSceneId);
    if (!scene) return null;

    return scene.shots.find((shot) => shot.id === graph.activeShotId) ?? null;
}

export function selectCompositionForShot(project: ProjectV2 | null | undefined, shot: ShotV1 | null | undefined) {
    if (!shot) return null;
    return project?.compositions?.[shot.compositionId] ?? null;
}

export function selectShotEnd(shot: ShotV1 | null | undefined): number | null {
    if (!shot) return null;
    return shot.start + shot.duration;
}
