import { buildSceneTree } from '../../domain/scene/buildSceneTree.js';
import { projectActiveSequenceView } from '../projection/selectors/sequenceSelectors.js';

function buildShotTimeline(sceneGraph, activeSceneId) {
    if (!sceneGraph || !Array.isArray(sceneGraph.scenes)) {
        return { shots: [] };
    }

    const scene = sceneGraph.scenes.find((item) => item.id === activeSceneId) ?? null;
    if (!scene || !Array.isArray(scene.shots)) {
        return { shots: [] };
    }

    const shots = scene.shots.map((shot) => {
        const startMs = Number.isFinite(shot.start) ? shot.start : 0;
        const durationMs = Number.isFinite(shot.duration) ? shot.duration : 0;
        const endMs = startMs + durationMs;

        let cameraTransform = null;
        if (shot.camera?.keyframes?.length) {
            const frames = shot.camera.keyframes;
            cameraTransform = {
                x: {
                    keyframes: frames.map((frame) => ({
                        t: frame.time,
                        v: frame.x,
                    })),
                },
                y: {
                    keyframes: frames.map((frame) => ({
                        t: frame.time,
                        v: frame.y,
                    })),
                },
            };
        }

        return {
            id: shot.id,
            startMs,
            endMs,
            cameraTransform,
            timeOffsetMs: Number.isFinite(shot.timeOffsetMs) ? shot.timeOffsetMs : undefined,
        };
    });

    return { shots };
}

function buildSequenceCameraTransform(runtimeState, timeMs) {
    const sequenceView = projectActiveSequenceView(runtimeState?.document, { timeMs });
    const cameraNodeRef = sequenceView?.activeCamera?.cameraNodeRef ?? null;
    if (!cameraNodeRef) return null;

    const node = runtimeState?.nodes?.[cameraNodeRef] ?? null;
    const transform = node?.props?.transform ?? {};

    return {
        x: Number(transform.x ?? 0),
        y: Number(transform.y ?? 0),
        zoom: Number(transform.scale ?? transform.zoom ?? 1),
        rotation: Number(transform.rotation ?? 0),
        nodeRef: cameraNodeRef,
        clipId: sequenceView?.activeCamera?.clipId ?? null,
        sequenceId: sequenceView?.sequenceId ?? null,
    };
}

export function buildEvaluationInputs(runtimeState, { timeMs = 0 } = {}) {
    const nodesById = runtimeState?.nodes ?? null;
    const rootIds = runtimeState?.rootIds ?? null;
    const sceneGraph = runtimeState?.sceneGraph ?? null;
    const activeSceneId = runtimeState?.scene?.activeSceneId ?? sceneGraph?.activeSceneId ?? null;
    const sceneActiveShotId = runtimeState?.scene?.activeShotId ?? null;
    const graphActiveShotId = sceneGraph?.activeShotId ?? null;

    const root = buildSceneTree({
        rootId: rootIds?.[0] ?? null,
        nodes: Object.values(nodesById ?? {}),
        tree: Object.fromEntries(
            Object.entries(nodesById ?? {}).map(([id, node]) => [
                id,
                Array.isArray(node?.children) ? node.children : [],
            ])
        ),
    });
    const sceneGraphTree = root ? [root] : [];
    const shotTimeline = buildShotTimeline(sceneGraph, activeSceneId);
    const activeShotId = sceneActiveShotId || graphActiveShotId || null;
    const cameraTransform = buildSequenceCameraTransform(runtimeState, timeMs);

    return {
        sceneGraphTree,
        shotTimeline,
        activeShotId,
        cameraTransform,
    };
}
