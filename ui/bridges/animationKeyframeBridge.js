import { canvasBus } from '../eventBus/canvasBus.js';
import { createAnimationKeyframeBridgeEvent } from '@/ui/bridges/intentEventFacade.js';

let _unsub = null;

/**
 * Registers the animation keyframe creation resolver once.
 * Canvas intent → domain event
 */
export function registerAnimationKeyframeBridge(dispatch) {
    if (_unsub) return _unsub;

    const handler = (intent) => {
        const event = createAnimationKeyframeBridgeEvent(intent);
        if (!event) return;
        if (typeof dispatch === 'function') {
            dispatch(event);
        } else {
            console.warn(
                '[animationKeyframeBridge] Dispatch not provided; skipping keyframe create.'
            );
        }
    };

    _unsub = canvasBus.on('intent.animation.keyframe.create', handler);
    return _unsub;
}
