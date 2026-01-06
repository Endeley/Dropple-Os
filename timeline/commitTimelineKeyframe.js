// timeline/commitTimelineKeyframe.js

import { nanoid } from 'nanoid';
import { EventTypes } from '@/core/events/eventTypes';

/**
 * Commit a timeline keyframe.
 *
 * 🔒 ID POLICY:
 * - IDs are created here (legal boundary)
 * - Reducers MUST receive keyframeId
 */
export function commitTimelineKeyframe({
    dispatcher,
    nodeId,
    trackId,
    time,
    property,
    value,
    easing = 'linear',
}) {
    if (!dispatcher) {
        throw new Error('commitTimelineKeyframe: dispatcher is required');
    }

    const keyframeId = nanoid();

    dispatcher.dispatch({
        type: EventTypes.TIMELINE_KEYFRAME_ADD,
        payload: {
            nodeId,
            trackId,
            keyframeId,
            time,
            property,
            value,
            easing,
        },
    });

    return keyframeId;
}
