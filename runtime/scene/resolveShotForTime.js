export function resolveShotForTime({ sceneGraph, activeSceneId, globalTime }) {
    if (!sceneGraph || !activeSceneId) return null;
    if (!Number.isFinite(globalTime)) return null;

    const scene = sceneGraph.scenes?.find((item) => item.id === activeSceneId);
    if (!scene || !Array.isArray(scene.shots) || scene.shots.length === 0) return null;

    let match = null;
    for (const shot of scene.shots) {
        if (!shot) continue;
        const start = Number.isFinite(shot.start) ? shot.start : 0;
        const duration = Number.isFinite(shot.duration) ? shot.duration : 0;
        const end = start + duration;
        const isLast = shot === scene.shots[scene.shots.length - 1];
        if (globalTime >= start && (globalTime < end || (isLast && globalTime <= end))) {
            match = { shot, start, end, duration };
            break;
        }
    }

    if (!match) return null;

    const localTime = Math.max(0, Math.min(globalTime - match.start, match.duration));

    return {
        shotId: match.shot.id,
        shot: match.shot,
        localTime,
        shotStart: match.start,
        shotEnd: match.end,
    };
}
