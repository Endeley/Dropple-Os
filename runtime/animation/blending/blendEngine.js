import { blendAnimationLayers } from './blendLayers.js';
import { stableCompare } from './blendUtils.js';

function normalizeClip(clip) {
    return {
        id: clip?.id ?? null,
        mode: clip?.mode ?? 'replace',
        weight: clip?.weight ?? 1,
        channels: Array.isArray(clip?.channels) ? clip.channels : [],
    };
}

function sortClips(clips) {
    return (clips || [])
        .filter(Boolean)
        .map(normalizeClip)
        .sort((left, right) => stableCompare(left.id, right.id));
}

export function evaluateAnimationBlend({
    timelineClips = [],
    stateMachineClips = [],
} = {}) {
    const layers = [
        ...sortClips(timelineClips),
        ...sortClips(stateMachineClips),
    ];

    return blendAnimationLayers(layers);
}

