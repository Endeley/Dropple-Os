import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { EventTypes } from '@/core/events/eventTypes.js';

let registered = false;

export function registerMotionBridge(dispatcher) {
    if (registered) return () => {};
    registered = true;

    const dispatch = dispatcher?.dispatch ?? null;

    const onKeyframeUpdate = (payload) => {
        if (!payload?.clipId || !payload?.keyframeId || !payload?.patch) return;
        if (typeof dispatch !== 'function') return;

        dispatch({
            type: EventTypes.MOTION_KEYFRAME_UPDATE,
            payload,
        });
    };

    const onKeyframeDelete = (payload) => {
        if (!payload?.clipId || !payload?.keyframeId) return;
        if (typeof dispatch !== 'function') return;

        dispatch({
            type: EventTypes.MOTION_KEYFRAME_DELETE,
            payload,
        });
    };

    canvasBus.on('intent.motion.keyframe.update', onKeyframeUpdate);
    canvasBus.on('intent.motion.keyframe.delete', onKeyframeDelete);

    return () => {
        registered = false;
        canvasBus.off('intent.motion.keyframe.update', onKeyframeUpdate);
        canvasBus.off('intent.motion.keyframe.delete', onKeyframeDelete);
    };
}
