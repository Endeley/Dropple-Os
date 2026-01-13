import { dispatcher } from '@/ui/interaction/dispatcher.js';
import { EventTypes } from '@/core/events/eventTypes.js';

/**
 * Commit a curve edit as a single easing update event.
 */
export function commitCurveChange({ keyframeId, easing, dispatch = dispatcher.dispatch } = {}) {
    if (!keyframeId || !easing) return;

    dispatch({
        type: EventTypes.ANIMATION_KEYFRAME_UPDATE,
        payload: {
            keyframeId,
            patch: { easing },
        },
    });
}
