import { EventTypes } from '@/core/events/eventTypes.js';

/**
 * Commit a curve edit as a single easing update event.
 */
export function commitCurveChange({ keyframeId, easing, dispatch } = {}) {
    if (!keyframeId || !easing) return;
    if (typeof dispatch !== 'function') return;

    dispatch({
        type: EventTypes.ANIMATION_KEYFRAME_UPDATE,
        payload: {
            keyframeId,
            patch: { easing },
        },
    });
}
