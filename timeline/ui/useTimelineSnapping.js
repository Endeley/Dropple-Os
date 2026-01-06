// timeline/ui/useTimelineSnapping.js

/**
 * Timeline snapping helper.
 *
 * 🔒 Rules:
 * - UI-only
 * - No dispatch
 * - No reducer access
 * - Deterministic snapping
 */
export function useTimelineSnapping({
    keyframes = [],
    playheadTime = null,
    snapThresholdPx = 6,
    pixelsPerMs = 0.1,
    gridMs = null, // e.g. 10, 50, 100 — null disables grid snapping
}) {
    const thresholdMs = snapThresholdPx / pixelsPerMs;

    function snapToGrid(time) {
        if (!gridMs) return null;
        return Math.round(time / gridMs) * gridMs;
    }

    function findNearest(targetTime) {
        let best = null;
        let bestDelta = Infinity;

        // snap to playhead
        if (typeof playheadTime === 'number') {
            const d = Math.abs(targetTime - playheadTime);
            if (d < bestDelta) {
                best = playheadTime;
                bestDelta = d;
            }
        }

        // snap to other keyframes
        for (const kf of keyframes) {
            if (kf.time == null) continue;
            const d = Math.abs(targetTime - kf.time);
            if (d < bestDelta) {
                best = kf.time;
                bestDelta = d;
            }
        }

        // snap to grid
        const gridTime = snapToGrid(targetTime);
        if (gridTime != null) {
            const d = Math.abs(targetTime - gridTime);
            if (d < bestDelta) {
                best = gridTime;
                bestDelta = d;
            }
        }

        if (bestDelta <= thresholdMs) {
            return best;
        }

        return null;
    }

    function applySnapping(rawTime) {
        const snapped = findNearest(rawTime);
        return snapped != null ? snapped : rawTime;
    }

    return {
        applySnapping,
        thresholdMs,
    };
}
