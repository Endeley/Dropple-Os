import { blendAnimationLayers } from './blendLayers.js';
import { stableCompare } from './blendUtils.js';

function normalizeClip(clip) {
    return {
        id: clip?.id ?? null,
        priority: Number.isFinite(clip?.priority) ? Number(clip.priority) : 0,
        intent: clip?.intent ?? null,
        mode: clip?.mode ?? 'replace',
        weight: clip?.weight ?? 1,
        channels: Array.isArray(clip?.channels) ? clip.channels : [],
    };
}

function sortClips(clips) {
    return (clips || [])
        .filter(Boolean)
        .map(normalizeClip)
        .sort((left, right) => {
            const priorityDelta = left.priority - right.priority;
            if (priorityDelta !== 0) return priorityDelta;
            return stableCompare(left.id, right.id);
        });
}

export function evaluateAnimationBlend({
    layers = null,
    timelineClips = [],
    stateMachineClips = [],
} = {}) {
    const resolvedLayers = Array.isArray(layers)
        ? sortClips(layers)
        : [...sortClips(timelineClips), ...sortClips(stateMachineClips)];

    return blendAnimationLayers(resolvedLayers);
}
