import { EventTypes } from '@/core/events/eventTypes.js';

/**
 * Track authoring tool (Phase 5B)
 *
 * Converts user intent → animation track events.
 * No preview. No state reads. No mutation.
 */
export function createTrack({ dispatch, trackId, nodeId, property }) {
    if (!dispatch || !trackId || !nodeId || !property) return;

    dispatch({
        type: EventTypes.ANIMATION_TRACK_CREATE,
        payload: {
            trackId,
            nodeId,
            property,
        },
    });
}

export function deleteTrack({ dispatch, trackId }) {
    if (!dispatch || !trackId) return;

    dispatch({
        type: EventTypes.ANIMATION_TRACK_DELETE,
        payload: {
            trackId,
        },
    });
}
