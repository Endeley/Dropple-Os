export { projectTimeline } from '../../projection/timelineProjection.js';

export function buildTimelineProjection(document) {
    return Object.values(document?.motion?.clips || {}).map((clip) => ({
        id: clip.id,
        target: clip.target,
        property: clip.property,
        keyframeCount: clip.keyframes?.length || 0,
        keyframes: (clip.keyframes || []).slice().sort((a, b) => a.t - b.t),
    }));
}
