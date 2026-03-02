import { canvasBus } from '../eventBus/canvasBus.js';
import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';
import { EventTypes } from '@/core/events/eventTypes.js';

let registered = false;
let warnedMissingDispatcher = false;

function safeDispatch(event) {
    try {
        const dispatcher = getRuntimeDispatcher();
        dispatcher.dispatch(event);
    } catch (err) {
        if (!warnedMissingDispatcher) {
            console.warn('[timelineBridge] Dispatcher not available; skipping timeline intent.', err);
            warnedMissingDispatcher = true;
        }
    }
}

export function registerTimelineBridge() {
    if (registered) return () => {};
    registered = true;

    const onTimelineAdd = (payload) => {
        if (!payload) return;
        safeDispatch({ type: EventTypes.TIMELINE_EVENT_ADD, payload });
    };
    const onTimelineUpdate = (payload) => {
        if (!payload) return;
        safeDispatch({ type: EventTypes.TIMELINE_EVENT_UPDATE, payload });
    };
    const onTimelineRemove = (payload) => {
        if (!payload) return;
        safeDispatch({ type: EventTypes.TIMELINE_EVENT_REMOVE, payload });
    };
    const onKeyframeCreate = (payload) => {
        if (!payload) return;
        safeDispatch({ type: EventTypes.ANIMATION_KEYFRAME_CREATE, payload });
    };
    const onKeyframeMove = (payload) => {
        if (!payload) return;
        safeDispatch({ type: EventTypes.TIMELINE_KEYFRAME_MOVE, payload });
    };
    const onKeyframeUpdate = (payload) => {
        if (!payload) return;
        safeDispatch({ type: EventTypes.ANIMATION_KEYFRAME_UPDATE, payload });
    };
    const onClockSeek = (payload) => {
        if (!payload) return;
        safeDispatch({ type: EventTypes.CLOCK_SEEK, payload });
    };
    const onClockPlay = () => {
        safeDispatch({ type: EventTypes.CLOCK_PLAY });
    };
    const onClockPause = () => {
        safeDispatch({ type: EventTypes.CLOCK_PAUSE });
    };
    const onShotSetActive = (payload) => {
        if (!payload) return;
        safeDispatch({ type: EventTypes.SHOT_SET_ACTIVE, payload });
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
