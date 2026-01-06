import { useCallback } from 'react';

/**
 * Computes preview time while dragging a keyframe.
 *
 * 🔒 Rules:
 * - UI-only
 * - No dispatch
 * - No reducer access
 * - Preview-only time updates
 */
export function useKeyframeDragPreview({
    pixelsPerMs = 0.1,
    minTime = 0,
    maxTime = Infinity,
    onPreviewTime,
}) {
    if (typeof onPreviewTime !== 'function') {
        throw new Error('useKeyframeDragPreview: onPreviewTime callback is required');
    }

    const onPointerMove = useCallback(
        (event, dragState) => {
            if (!dragState) return;

            const dx = event.clientX - dragState.startX;
            const deltaTime = dx / pixelsPerMs;

            let nextTime = dragState.startTime + deltaTime;

            if (nextTime < minTime) nextTime = minTime;
            if (nextTime > maxTime) nextTime = maxTime;

            onPreviewTime({
                keyframeId: dragState.keyframeId,
                time: nextTime,
            });
        },
        [pixelsPerMs, minTime, maxTime, onPreviewTime]
    );

    return {
        onPointerMove,
    };
}
