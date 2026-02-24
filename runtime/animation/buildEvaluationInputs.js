function buildSceneTree(nodesById, rootIds) {
    if (!nodesById || !Array.isArray(rootIds)) return null;
    const visiting = new Set();

    function buildNode(id) {
        const node = nodesById[id];
        if (!node || visiting.has(id)) return null;
        visiting.add(id);
        const childIds = Array.isArray(node.children) ? node.children : [];
        const children = childIds.map(buildNode).filter(Boolean);
        visiting.delete(id);
        return { ...node, children };
    }

    return rootIds.map(buildNode).filter(Boolean);
}

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

export function buildEvaluationInputs(runtimeState) {
    const nodesById = runtimeState?.nodes ?? null;
    const rootIds = runtimeState?.rootIds ?? null;
    const sceneGraph = runtimeState?.sceneGraph ?? null;
    const activeSceneId = runtimeState?.scene?.activeSceneId ?? sceneGraph?.activeSceneId ?? null;
    const sceneActiveShotId = runtimeState?.scene?.activeShotId ?? null;
    const graphActiveShotId = sceneGraph?.activeShotId ?? null;

    const sceneGraphTree = buildSceneTree(nodesById, rootIds);
    const shotTimeline = buildShotTimeline(sceneGraph, activeSceneId);
    const activeShotId = sceneActiveShotId || graphActiveShotId || null;

    return {
        sceneGraphTree,
        shotTimeline,
        activeShotId,
        cameraTransform: null,
    };
}
