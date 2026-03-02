import { canvasBus } from '../eventBus/canvasBus.js';
import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';
import { createAnimationKeyframeEvent } from '@/runtime/input/animationKeyframeRuntimeBridge.js';

let _unsub = null;
let warnedMissingDispatcher = false;

function safeDispatch(event) {
    try {
        const dispatcher = getRuntimeDispatcher();
        dispatcher.dispatch(event);
    } catch (err) {
        if (!warnedMissingDispatcher) {
            console.warn('[animationKeyframeBridge] Dispatcher not available; skipping keyframe create.', err);
            warnedMissingDispatcher = true;
        }
    }
}

/**
 * Registers the animation keyframe creation resolver once.
 * Canvas intent → domain event
 */
export function registerAnimationKeyframeBridge() {
    if (_unsub) return _unsub;

    const handler = (intent) => {
        const event = createAnimationKeyframeEvent(intent);
        if (!event) return;
        safeDispatch(event);
    };

    _unsub = canvasBus.on('intent.animation.keyframe.create', handler);
    return _unsub;
}
