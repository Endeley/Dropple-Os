import { canvasBus } from '../eventBus/canvasBus.js';
import { EventTypes } from '@/core/events/eventTypes.js';

let registered = false;

export function registerTimelineBridge(dispatcher) {
    if (registered) return () => {};
    registered = true;
    const dispatch = dispatcher?.dispatch;

    const onTimelineAdd = (payload) => {
        if (!payload) return;
        if (typeof dispatch === 'function') {
            dispatch({ type: EventTypes.TIMELINE_EVENT_ADD, payload });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping timeline add.');
        }
    };
    const onTimelineUpdate = (payload) => {
        if (!payload) return;
        if (typeof dispatch === 'function') {
            dispatch({ type: EventTypes.TIMELINE_EVENT_UPDATE, payload });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping timeline update.');
        }
    };
    const onTimelineRemove = (payload) => {
        if (!payload) return;
        if (typeof dispatch === 'function') {
            dispatch({ type: EventTypes.TIMELINE_EVENT_REMOVE, payload });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping timeline remove.');
        }
    };
    const onKeyframeCreate = (payload) => {
        if (!payload) return;
        if (typeof dispatch === 'function') {
            dispatch({ type: EventTypes.ANIMATION_KEYFRAME_CREATE, payload });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping keyframe create.');
        }
    };
    const onKeyframeMove = (payload) => {
        if (!payload) return;
        if (typeof dispatch === 'function') {
            dispatch({ type: EventTypes.TIMELINE_KEYFRAME_MOVE, payload });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping keyframe move.');
        }
    };
    const onKeyframeUpdate = (payload) => {
        if (!payload) return;
        if (typeof dispatch === 'function') {
            dispatch({ type: EventTypes.ANIMATION_KEYFRAME_UPDATE, payload });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping keyframe update.');
        }
    };
    const onClockSeek = (payload) => {
        if (!payload) return;
        if (typeof dispatch === 'function') {
            dispatch({ type: EventTypes.CLOCK_SEEK, payload });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping clock seek.');
        }
    };
    const onClockPlay = () => {
        if (typeof dispatch === 'function') {
            dispatch({ type: EventTypes.CLOCK_PLAY });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping clock play.');
        }
    };
    const onClockPause = () => {
        if (typeof dispatch === 'function') {
            dispatch({ type: EventTypes.CLOCK_PAUSE });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping clock pause.');
        }
    };
    const onShotSetActive = (payload) => {
        if (!payload) return;
        if (typeof dispatch === 'function') {
            dispatch({ type: EventTypes.SHOT_SET_ACTIVE, payload });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping shot set active.');
        }
    };

    canvasBus.on('intent.timeline.add', onTimelineAdd);
    canvasBus.on('intent.timeline.update', onTimelineUpdate);
    canvasBus.on('intent.timeline.remove', onTimelineRemove);
    canvasBus.on('intent.keyframe.create', onKeyframeCreate);
    canvasBus.on('intent.keyframe.move', onKeyframeMove);
    canvasBus.on('intent.keyframe.update', onKeyframeUpdate);
    canvasBus.on('intent.clock.seek', onClockSeek);
    canvasBus.on('intent.clock.play', onClockPlay);
    canvasBus.on('intent.clock.pause', onClockPause);
    canvasBus.on('intent.shot.setActive', onShotSetActive);

    return () => {
        canvasBus.off('intent.timeline.add', onTimelineAdd);
        canvasBus.off('intent.timeline.update', onTimelineUpdate);
        canvasBus.off('intent.timeline.remove', onTimelineRemove);
        canvasBus.off('intent.keyframe.create', onKeyframeCreate);
        canvasBus.off('intent.keyframe.move', onKeyframeMove);
        canvasBus.off('intent.keyframe.update', onKeyframeUpdate);
        canvasBus.off('intent.clock.seek', onClockSeek);
        canvasBus.off('intent.clock.play', onClockPlay);
        canvasBus.off('intent.clock.pause', onClockPause);
        canvasBus.off('intent.shot.setActive', onShotSetActive);
        registered = false;
    };
}
