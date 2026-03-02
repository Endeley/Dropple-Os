import { timelineIntentKeyframeUpdate } from '@/ui/timeline/timelineIntent.js';

/**
 * Commit a curve edit as a single easing update event.
 */
export function commitCurveChange({ keyframeId, easing } = {}) {
    if (!keyframeId || !easing) return;

    timelineIntentKeyframeUpdate({
        keyframeId,
        patch: { easing },
    });
}
