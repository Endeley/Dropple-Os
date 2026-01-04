import { interpolateNodes } from '@/runtime/animation/interpolateNodes.js';

/**
 * Evaluates timeline state at a specific time.
 * Pure function. No side effects. Currently step-based (no interpolation).
 */
export function evaluateTimelineAtTime({ state, time }) {
    const timeline = state.timeline?.timelines?.default;
    if (!timeline) return state.nodes;

    let resultNodes = { ...state.nodes };

    timeline.tracks.forEach((track) => {
        if (!track || track.muted) return;

        const targetId = track.targetId || track.nodeId;
        if (!targetId) return;

        track.clips.forEach((clip) => {
            if (time < clip.start || time > clip.end) return;

            clip.keyframes.forEach((kf) => {
                if (kf.time > time) return;

                const node = resultNodes[targetId];
                if (!node) return;

                resultNodes[targetId] = {
                    ...node,
                    [kf.property]: kf.value,
                };
            });
        });
    });

    return resultNodes;
}
