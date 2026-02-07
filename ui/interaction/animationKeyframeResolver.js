// ui/interaction/animationKeyframeResolver.js
import { nanoid } from 'nanoid';
import { canvasBus } from '@/ui/canvasBus.js';
import { dispatcher } from './dispatcher.js';
import { EventTypes } from '@/core/events/eventTypes.js';

let _unsub = null;
let warnedMissingDispatcher = false;

function safeDispatch(event) {
    try {
        dispatcher.dispatch(event);
    } catch (err) {
        if (!warnedMissingDispatcher) {
            console.warn('[animationKeyframeResolver] Dispatcher not attached; skipping keyframe create.', err);
            warnedMissingDispatcher = true;
        }
    }
}

function stableTrackId(nodeId, property) {
    return `track-${nodeId}-${property}`;
}

function stableKeyframeId(trackId, timeMs) {
    return `kf-${trackId}-${timeMs}`;
}

/**
 * Registers the animation keyframe creation resolver once.
 * Canvas intent → domain event
 */
export function registerAnimationKeyframeResolver() {
    if (_unsub) return _unsub;

    const handler = (intent) => {
        if (!intent) return;

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

        safeDispatch({
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
        });
    };

    _unsub = canvasBus.on('intent.animation.keyframe.create', handler);
    return _unsub;
}
