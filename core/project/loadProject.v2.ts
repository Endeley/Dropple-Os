import type { ProjectV2, Composition, Asset } from '../contracts/project.v2';
import { DEFAULT_SHOT_DURATION_MS } from './initProjectWithSceneGraph.v2';

type ProjectV1 = {
    version: 1;
    id: string;
    name: string;
    compositions: Record<string, Composition>;
    assets: Record<string, Asset>;
    rootCompositionId?: string;
};

export function loadProjectV2(project: ProjectV1 | ProjectV2): ProjectV2 {
    if (!project || typeof project !== 'object') {
        throw new Error('loadProjectV2: project is required');
    }

    if (project.version === 2) return normalizeProjectV2(project);
    if (project.version === 1) return migrateProjectV1ToV2(project);

    throw new Error(`loadProjectV2: unsupported version ${project.version}`);
}

function migrateProjectV1ToV2(project: ProjectV1): ProjectV2 {
    const rootCompositionId = resolveRootCompositionId(project);
    const sceneId = `scene-${rootCompositionId}`;
    const shotId = `shot-${rootCompositionId}`;

    const migrated: ProjectV2 = {
        version: 2,
        id: project.id,
        name: project.name,
        compositions: project.compositions ?? {},
        assets: project.assets ?? {},
        sceneGraph: {
            version: 1,
            activeSceneId: sceneId,
            activeShotId: shotId,
            scenes: [
                {
                    id: sceneId,
                    name: 'Scene 1',
                    duration: DEFAULT_SHOT_DURATION_MS,
                    shots: [
                        {
                            id: shotId,
                            name: 'Shot 1',
                            start: 0,
                            duration: DEFAULT_SHOT_DURATION_MS,
                            compositionId: rootCompositionId,
                        },
                    ],
                },
            ],
        },
    };

    return normalizeShotTimelines(migrated);
}

function normalizeProjectV2(project: ProjectV2): ProjectV2 {
    const graph = project.sceneGraph;
    if (!graph) return project;

    const normalized = normalizeShotTimelines(project);
    const normalizedGraph = normalized.sceneGraph;
    if (normalizedGraph?.activeShotId) return normalized;
    if (!graph.activeSceneId) {
        return {
            ...normalized,
            sceneGraph: {
                ...normalizedGraph,
                activeShotId: null,
            },
        };
    }

    const scene = normalizedGraph.scenes?.find((item) => item.id === normalizedGraph.activeSceneId);
    const firstShotId = scene?.shots?.[0]?.id ?? null;

    return {
        ...normalized,
        sceneGraph: {
            ...normalizedGraph,
            activeShotId: firstShotId,
        },
    };
}

function normalizeShotTimelines(project: ProjectV2): ProjectV2 {
    const graph = project.sceneGraph;
    if (!graph?.scenes?.length) return project;

    let changed = false;
    const scenes = graph.scenes.map((scene) => {
        if (!scene?.shots?.length) return scene;
        const shots = scene.shots.map((shot) => {
            if (!shot?.timeline) return shot;

            if (typeof shot.timeline === 'object' && 'animations' in shot.timeline) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('[SceneGraph] Nested timeline shape detected; normalized.');
                }
                changed = true;
                return {
                    ...shot,
                    timeline: shot.timeline.motion ?? shot.timeline.animations,
                };
            }

            if (process.env.NODE_ENV === 'development') {
                const hasClips = Boolean(shot.timeline?.clips);
                const hasTracks = Boolean(shot.timeline?.tracks);
                if (!hasClips && !hasTracks) {
                    console.warn('[SceneGraph] Timeline shape looks invalid.', {
                        shotId: shot.id,
                    });
                }
            }

            return shot;
        });
        return shots === scene.shots ? scene : { ...scene, shots };
    });

    if (!changed) return project;
    return {
        ...project,
        sceneGraph: {
            ...graph,
            scenes,
        },
    };
}

function resolveRootCompositionId(project: ProjectV1): string {
    const compositions = project.compositions ?? {};
    const ids = Object.keys(compositions);

    const hinted = project.rootCompositionId;
    if (hinted && compositions[hinted]) return hinted;

    if (ids.length === 1) return ids[0];
    if (compositions.root) return 'root';
    if (compositions.default) return 'default';
    if (ids.length > 0) return ids.sort()[0];

    throw new Error('loadProjectV2: no compositions found to seed SceneGraph');
}
