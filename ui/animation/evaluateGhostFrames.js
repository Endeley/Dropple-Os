import { evaluateTimeline } from '@/timeline/evaluateTimeline';
import { applyCharacterConstraints } from '@/runtime/characters/applyCharacterConstraints.js';
import { applyAttachments } from '@/runtime/attachments/applyAttachments.js';
import { getPrevKeyframeTime } from '@/ui/timeline/keyframeTimeUtils.js';

function getAnimationDurationMs(animations) {
    if (!animations?.clips) return 0;
    return Object.values(animations.clips).reduce(
        (max, clip) => Math.max(max, clip?.durationMs || 0),
        0
    );
}

/**
 * Pure, derived-only ghost frame evaluation.
 */
export function evaluateGhostFrames({
    designState,
    baseTimeMs,
    offsetsMs,
    previewInterpolation = 'interpolate',
    keyframeTimes = [],
}) {
    const animations = designState?.timeline?.animations;
    if (!animations) return [];

    const durationMs = getAnimationDurationMs(animations);
    const base = Number.isFinite(baseTimeMs) ? baseTimeMs : 0;
    const offsets = Array.isArray(offsetsMs) ? offsetsMs : [];

    return offsets.map((offset) => {
        const rawTime = base + offset;
        const clamped = Math.max(0, Math.min(rawTime, durationMs));
        const effectiveTime = previewInterpolation === 'hold'
            ? (getPrevKeyframeTime(keyframeTimes, clamped) ?? clamped)
            : clamped;

        const projected = evaluateTimeline({
            animations,
            timeMs: effectiveTime,
            baseState: designState,
        });
        const withCharacters = applyCharacterConstraints(projected?.nodes || {});
        const nodes = applyAttachments(withCharacters || {});

        return {
            timeMs: effectiveTime,
            offsetMs: offset,
            nodes,
        };
    });
}
