import { canvasBus } from '../eventBus/canvasBus.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { TIMELINE_INTENTS } from '@/ui/timeline/timelineIntent.js';

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
    const onTimelineTrackCreate = (payload) => {
        if (!payload?.id) return;
        if (typeof dispatch === 'function') {
            dispatch({
                type: EventTypes.TIMELINE_TRACK_CREATE,
                payload: {
                    id: payload.id,
                    type: payload.type ?? 'standard',
                },
            });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping timeline track create.');
        }
    };
    const onTimelineTrackDelete = (payload) => {
        if (!payload?.id) return;
        if (typeof dispatch === 'function') {
            dispatch({
                type: EventTypes.TIMELINE_TRACK_DELETE,
                payload: {
                    id: payload.id,
                },
            });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping timeline track delete.');
        }
    };
    const onTimelineTrackReorder = (payload) => {
        if (!payload?.id || !Number.isInteger(payload?.toIndex)) return;
        if (typeof dispatch === 'function') {
            dispatch({
                type: EventTypes.TIMELINE_TRACK_REORDER,
                payload: {
                    id: payload.id,
                    toIndex: payload.toIndex,
                },
            });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping timeline track reorder.');
        }
    };
    const onTimelineTrackChannelAssign = (payload) => {
        if (!payload?.trackId || !payload?.channelId) return;
        if (typeof dispatch === 'function') {
            dispatch({
                type: EventTypes.TIMELINE_TRACK_CHANNEL_ASSIGN,
                payload: {
                    trackId: payload.trackId,
                    channelId: payload.channelId,
                },
            });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping timeline track channel assign.');
        }
    };
    const onTimelineTrackLockToggle = (payload) => {
        if (!payload?.id) return;
        if (typeof dispatch === 'function') {
            dispatch({
                type: EventTypes.TIMELINE_TRACK_LOCK_TOGGLE,
                payload: {
                    id: payload.id,
                },
            });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping timeline track lock toggle.');
        }
    };
    const onTimelineTrackBlendModeSet = (payload) => {
        if (!payload?.id || !payload?.blendMode) return;
        if (typeof dispatch === 'function') {
            dispatch({
                type: EventTypes.TIMELINE_TRACK_BLEND_MODE_SET,
                payload: {
                    id: payload.id,
                    blendMode: payload.blendMode,
                },
            });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping timeline track blend mode set.');
        }
    };
    const onTimelineGroupCreate = (payload) => {
        if (!payload?.id) return;
        if (typeof dispatch === 'function') {
            dispatch({
                type: EventTypes.TIMELINE_GROUP_CREATE,
                payload: {
                    id: payload.id,
                },
            });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping timeline group create.');
        }
    };
    const onTimelineGroupDelete = (payload) => {
        if (!payload?.id) return;
        if (typeof dispatch === 'function') {
            dispatch({
                type: EventTypes.TIMELINE_GROUP_DELETE,
                payload: {
                    id: payload.id,
                },
            });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping timeline group delete.');
        }
    };
    const onTimelineGroupLockToggle = (payload) => {
        if (!payload?.id) return;
        if (typeof dispatch === 'function') {
            dispatch({
                type: EventTypes.TIMELINE_GROUP_LOCK_TOGGLE,
                payload: {
                    id: payload.id,
                },
            });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping timeline group lock toggle.');
        }
    };
    const onTimelineGroupCollapseToggle = (payload) => {
        if (!payload?.id) return;
        if (typeof dispatch === 'function') {
            dispatch({
                type: EventTypes.TIMELINE_GROUP_COLLAPSE_TOGGLE,
                payload: {
                    id: payload.id,
                },
            });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping collapse toggle.');
        }
    };
    const onTimelineGroupTrackAssign = (payload) => {
        if (!payload?.groupId || !payload?.trackId) return;
        if (typeof dispatch === 'function') {
            dispatch({
                type: EventTypes.TIMELINE_GROUP_TRACK_ASSIGN,
                payload: {
                    groupId: payload.groupId,
                    trackId: payload.trackId,
                },
            });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping timeline group track assign.');
        }
    };
    const onTimelineGroupTrackUnassign = (payload) => {
        if (!payload?.groupId || !payload?.trackId) return;
        if (typeof dispatch === 'function') {
            dispatch({
                type: EventTypes.TIMELINE_GROUP_TRACK_UNASSIGN,
                payload: {
                    groupId: payload.groupId,
                    trackId: payload.trackId,
                },
            });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping timeline group track unassign.');
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
    const onKeyframeDelete = (payload) => {
        if (!payload) return;
        if (typeof dispatch === 'function') {
            dispatch({ type: EventTypes.ANIMATION_KEYFRAME_DELETE, payload });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping keyframe delete.');
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
    const onSequenceCreate = (payload) => {
        if (!payload) return;
        if (typeof dispatch === 'function') {
            dispatch({ type: EventTypes.SEQUENCE_CREATE, payload });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping sequence create.');
        }
    };
    const onSequenceSetActive = (payload) => {
        if (!payload) return;
        if (typeof dispatch === 'function') {
            dispatch({ type: EventTypes.SEQUENCE_SET_ACTIVE, payload });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping sequence set active.');
        }
    };
    const onSequenceTrackCreate = (payload) => {
        if (!payload) return;
        if (typeof dispatch === 'function') {
            dispatch({ type: EventTypes.SEQUENCE_TRACK_CREATE, payload });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping sequence track create.');
        }
    };
    const onSequenceClipCreate = (payload) => {
        if (!payload) return;
        if (typeof dispatch === 'function') {
            dispatch({ type: EventTypes.SEQUENCE_CLIP_CREATE, payload });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping sequence clip create.');
        }
    };
    const onSequenceClipUpdate = (payload) => {
        if (!payload) return;
        if (typeof dispatch === 'function') {
            dispatch({ type: EventTypes.SEQUENCE_CLIP_UPDATE, payload });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping sequence clip update.');
        }
    };
    const onSequenceClipDelete = (payload) => {
        if (!payload) return;
        if (typeof dispatch === 'function') {
            dispatch({ type: EventTypes.SEQUENCE_CLIP_DELETE, payload });
        } else {
            console.warn('[timelineBridge] Dispatcher not provided; skipping sequence clip delete.');
        }
    };

    canvasBus.on(TIMELINE_INTENTS.TRACK_CREATE, onTimelineTrackCreate);
    canvasBus.on(TIMELINE_INTENTS.TRACK_DELETE, onTimelineTrackDelete);
    canvasBus.on(TIMELINE_INTENTS.TRACK_REORDER, onTimelineTrackReorder);
    canvasBus.on(TIMELINE_INTENTS.TRACK_CHANNEL_ASSIGN, onTimelineTrackChannelAssign);
    canvasBus.on(TIMELINE_INTENTS.TRACK_LOCK_TOGGLE, onTimelineTrackLockToggle);
    canvasBus.on(TIMELINE_INTENTS.TRACK_BLEND_MODE_SET, onTimelineTrackBlendModeSet);
    canvasBus.on(TIMELINE_INTENTS.GROUP_CREATE, onTimelineGroupCreate);
    canvasBus.on(TIMELINE_INTENTS.GROUP_DELETE, onTimelineGroupDelete);
    canvasBus.on(TIMELINE_INTENTS.GROUP_LOCK_TOGGLE, onTimelineGroupLockToggle);
    canvasBus.on(TIMELINE_INTENTS.GROUP_COLLAPSE_TOGGLE, onTimelineGroupCollapseToggle);
    canvasBus.on(TIMELINE_INTENTS.GROUP_TRACK_ASSIGN, onTimelineGroupTrackAssign);
    canvasBus.on(TIMELINE_INTENTS.GROUP_TRACK_UNASSIGN, onTimelineGroupTrackUnassign);
    canvasBus.on('intent.timeline.add', onTimelineAdd);
    canvasBus.on('intent.timeline.update', onTimelineUpdate);
    canvasBus.on('intent.timeline.remove', onTimelineRemove);
    canvasBus.on('intent.keyframe.create', onKeyframeCreate);
    canvasBus.on('intent.keyframe.move', onKeyframeMove);
    canvasBus.on('intent.keyframe.update', onKeyframeUpdate);
    canvasBus.on('intent.keyframe.delete', onKeyframeDelete);
    canvasBus.on('intent.clock.seek', onClockSeek);
    canvasBus.on('intent.clock.play', onClockPlay);
    canvasBus.on('intent.clock.pause', onClockPause);
    canvasBus.on('intent.sequence.create', onSequenceCreate);
    canvasBus.on('intent.sequence.setActive', onSequenceSetActive);
    canvasBus.on('intent.sequence.track.create', onSequenceTrackCreate);
    canvasBus.on('intent.sequence.clip.create', onSequenceClipCreate);
    canvasBus.on('intent.sequence.clip.update', onSequenceClipUpdate);
    canvasBus.on('intent.sequence.clip.delete', onSequenceClipDelete);

    return () => {
        canvasBus.off(TIMELINE_INTENTS.TRACK_CREATE, onTimelineTrackCreate);
        canvasBus.off(TIMELINE_INTENTS.TRACK_DELETE, onTimelineTrackDelete);
        canvasBus.off(TIMELINE_INTENTS.TRACK_REORDER, onTimelineTrackReorder);
        canvasBus.off(TIMELINE_INTENTS.TRACK_CHANNEL_ASSIGN, onTimelineTrackChannelAssign);
        canvasBus.off(TIMELINE_INTENTS.TRACK_LOCK_TOGGLE, onTimelineTrackLockToggle);
        canvasBus.off(TIMELINE_INTENTS.TRACK_BLEND_MODE_SET, onTimelineTrackBlendModeSet);
        canvasBus.off(TIMELINE_INTENTS.GROUP_CREATE, onTimelineGroupCreate);
        canvasBus.off(TIMELINE_INTENTS.GROUP_DELETE, onTimelineGroupDelete);
        canvasBus.off(TIMELINE_INTENTS.GROUP_LOCK_TOGGLE, onTimelineGroupLockToggle);
        canvasBus.off(TIMELINE_INTENTS.GROUP_COLLAPSE_TOGGLE, onTimelineGroupCollapseToggle);
        canvasBus.off(TIMELINE_INTENTS.GROUP_TRACK_ASSIGN, onTimelineGroupTrackAssign);
        canvasBus.off(TIMELINE_INTENTS.GROUP_TRACK_UNASSIGN, onTimelineGroupTrackUnassign);
        canvasBus.off('intent.timeline.add', onTimelineAdd);
        canvasBus.off('intent.timeline.update', onTimelineUpdate);
        canvasBus.off('intent.timeline.remove', onTimelineRemove);
        canvasBus.off('intent.keyframe.create', onKeyframeCreate);
        canvasBus.off('intent.keyframe.move', onKeyframeMove);
        canvasBus.off('intent.keyframe.update', onKeyframeUpdate);
        canvasBus.off('intent.keyframe.delete', onKeyframeDelete);
        canvasBus.off('intent.clock.seek', onClockSeek);
        canvasBus.off('intent.clock.play', onClockPlay);
        canvasBus.off('intent.clock.pause', onClockPause);
        canvasBus.off('intent.sequence.create', onSequenceCreate);
        canvasBus.off('intent.sequence.setActive', onSequenceSetActive);
        canvasBus.off('intent.sequence.track.create', onSequenceTrackCreate);
        canvasBus.off('intent.sequence.clip.create', onSequenceClipCreate);
        canvasBus.off('intent.sequence.clip.update', onSequenceClipUpdate);
        canvasBus.off('intent.sequence.clip.delete', onSequenceClipDelete);
        registered = false;
    };
}
