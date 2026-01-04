/**
 * Pure keyframe utilities.
 * No side effects. Safe for undo/replay/AI.
 */
export function addKeyframe(track, keyframe) {
    const keyframes = [...(track.keyframes || []), keyframe].sort((a, b) => a.time - b.time);
    return { ...track, keyframes };
}

export function updateKeyframe(track, keyframeId, patch) {
    return {
        ...track,
        keyframes: (track.keyframes || []).map((k) => (k.id === keyframeId ? { ...k, ...patch } : k)),
    };
}

export function removeKeyframe(track, keyframeId) {
    return {
        ...track,
        keyframes: (track.keyframes || []).filter((k) => k.id !== keyframeId),
    };
}
