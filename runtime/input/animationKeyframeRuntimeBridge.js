import { nanoid } from 'nanoid';
import { canvasBus } from '@/infrastructure/eventBus/canvasBus.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';

let _unsub = null;
let warnedMissingDispatcher = false;

function safeDispatch(event) {
    try {
        const dispatcher = getRuntimeDispatcher();
        dispatcher.dispatch(event);
    } catch (err) {
        if (!warnedMissingDispatcher) {
            console.warn('[animationKeyframeRuntimeBridge] Dispatcher not available; skipping keyframe create.', err);
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
export function registerAnimationKeyframeRuntimeBridge() {
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
