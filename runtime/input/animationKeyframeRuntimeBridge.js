import { nanoid } from 'nanoid';
import { EventTypes } from '../../core/events/eventTypes.js';

function stableTrackId(nodeId, property) {
    return `track-${nodeId}-${property}`;
}

function stableKeyframeId(trackId, timeMs) {
    return `kf-${trackId}-${timeMs}`;
}

/**
 * Builds a keyframe creation event from an intent.
 */
export function createAnimationKeyframeEvent(intent) {
    if (!intent) return null;

    const {
        nodeId,
        property,
        timeMs,
        value,
        easing = 'linear',
        clipId = 'clip-default',
    } = intent;

    const trackId = intent?.trackId || stableTrackId(nodeId, property);
    const keyframeId = intent?.keyframeId || stableKeyframeId(trackId, timeMs);

    return {
        type: EventTypes.ANIMATION_KEYFRAME_CREATE,
        payload: {
            nodeId,
            property,
            timeMs,
            value,
            easing,
            clipId,
            trackId,
            keyframeId,
            source: intent?.source || 'intent.animation.keyframe.create',
            intentId: intent?.id || `intent-${nanoid()}`,
        },
    };
}
