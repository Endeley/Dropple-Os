import { EventTypes } from '@/core/events/eventTypes.js';

/**
 * Keyframe authoring tool (Phase 5B)
 *
 * Emits explicit keyframe events.
 */
export function addKeyframe({ dispatch, trackId, keyframe }) {
    if (!dispatch || !trackId || !keyframe?.id) return;

    dispatch({
        type: EventTypes.ANIMATION_KEYFRAME_ADD,
        payload: {
            trackId,
            keyframe,
        },
    });
}

export function updateKeyframe({ dispatch, trackId, keyframeId, patch }) {
    if (!dispatch || !trackId || !keyframeId || !patch) return;

    dispatch({
        type: EventTypes.ANIMATION_KEYFRAME_UPDATE,
        payload: {
            trackId,
            keyframeId,
            patch,
        },
    });
}

export function deleteKeyframe({ dispatch, trackId, keyframeId }) {
    if (!dispatch || !trackId || !keyframeId) return;

    dispatch({
        type: EventTypes.ANIMATION_KEYFRAME_DELETE,
        payload: {
            trackId,
            keyframeId,
        },
    });
}
