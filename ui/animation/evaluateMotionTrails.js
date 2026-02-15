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

function getNodeCenter(layout) {
    if (!layout) return null;
    const x = Number.isFinite(layout.x) ? layout.x : null;
    const y = Number.isFinite(layout.y) ? layout.y : null;
    const w = Number.isFinite(layout.width) ? layout.width : null;
    const h = Number.isFinite(layout.height) ? layout.height : null;
    if (x == null || y == null || w == null || h == null) return null;
    return { x: x + w / 2, y: y + h / 2 };
}

export function evaluateMotionTrails({
    designState,
    baseTimeMs,
    nodeIds,
    steps,
    stepMs,
    previewInterpolation = 'interpolate',
    keyframeTimes = [],
}) {
    const animations = designState?.timeline?.animations;
    if (!animations || !nodeIds?.length) return {};

    const durationMs = getAnimationDurationMs(animations);
    const base = Number.isFinite(baseTimeMs) ? baseTimeMs : 0;
    const maxSteps = Number.isFinite(steps) && steps > 0 ? Math.floor(steps) : 0;
    const step = Number.isFinite(stepMs) && stepMs > 0 ? stepMs : 0;
    if (maxSteps <= 0 || step <= 0) return {};

    const trails = {};
    nodeIds.forEach((id) => {
        trails[id] = [];
    });

    for (let i = 0; i < maxSteps; i += 1) {
        const rawTime = base - i * step;
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

        nodeIds.forEach((id) => {
            const center = getNodeCenter(nodes?.[id]?.layout);
            if (!center) return;
            trails[id].push({
                x: center.x,
                y: center.y,
                t: effectiveTime,
            });
        });
    }

    return trails;
}
