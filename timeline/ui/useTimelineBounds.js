// timeline/ui/useTimelineBounds.js

/**
 * Timeline bounds helper.
 *
 * 🔒 Rules:
 * - UI-only
 * - No dispatch
 * - Deterministic math
 */
export function useTimelineBounds({ duration }) {
    if (typeof duration !== 'number') {
        throw new Error('useTimelineBounds: duration is required');
    }

    function clampTime(time) {
        if (time < 0) return 0;
        if (time > duration) return duration;
        return time;
    }

    function clampDelta({ startTime, nextTime }) {
        const clamped = clampTime(nextTime);
        return {
            time: clamped,
            delta: clamped - startTime,
        };
    }

    return {
        clampTime,
        clampDelta,
    };
}
