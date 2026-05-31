import { canvasBus } from '../eventBus/canvasBus.js';
import { shotEditorIntentSetActive } from '@/ui/workspace/editor/shotEditorIntent.js';
import { createUuid } from '@/core/utils/createUuid.js';

export const TIMELINE_INTENTS = Object.freeze({
    TRACK_CREATE: 'intent.timeline.track.create',
    TRACK_DELETE: 'intent.timeline.track.delete',
    TRACK_REORDER: 'intent.timeline.track.reorder',
    TRACK_CHANNEL_ASSIGN: 'intent.timeline.track.channel.assign',
    TRACK_LOCK_TOGGLE: 'intent.timeline.track.lock.toggle',
    TRACK_BLEND_MODE_SET: 'intent.timeline.track.blend-mode.set',
    GROUP_CREATE: 'intent.timeline.group.create',
    GROUP_DELETE: 'intent.timeline.group.delete',
    GROUP_LOCK_TOGGLE: 'intent.timeline.group.lock.toggle',
    GROUP_COLLAPSE_TOGGLE: 'intent.timeline.group.collapse.toggle',
    GROUP_TRACK_ASSIGN: 'intent.timeline.group.track.assign',
    GROUP_TRACK_UNASSIGN: 'intent.timeline.group.track.unassign',
});

export function timelineIntentTrackCreate(payload) {
    if (!payload?.id) return;
    canvasBus.emit(TIMELINE_INTENTS.TRACK_CREATE, {
        type: payload?.type ?? 'standard',
        ...payload,
    });
}

export function timelineIntentTrackDelete(payload) {
    if (!payload?.id) return;
    canvasBus.emit(TIMELINE_INTENTS.TRACK_DELETE, payload);
}

export function timelineIntentTrackReorder(payload) {
    if (!payload?.id || !Number.isInteger(payload?.toIndex)) return;
    canvasBus.emit(TIMELINE_INTENTS.TRACK_REORDER, payload);
}

export function timelineIntentTrackChannelAssign(payload) {
    if (!payload?.trackId || !payload?.channelId) return;
    canvasBus.emit(TIMELINE_INTENTS.TRACK_CHANNEL_ASSIGN, payload);
}

export function timelineIntentTrackLockToggle(payload) {
    if (!payload?.id) return;
    canvasBus.emit(TIMELINE_INTENTS.TRACK_LOCK_TOGGLE, payload);
}

export function timelineIntentTrackBlendModeSet(payload) {
    if (!payload?.id || !payload?.blendMode) return;
    canvasBus.emit(TIMELINE_INTENTS.TRACK_BLEND_MODE_SET, payload);
}

export function timelineIntentGroupCreate(payload) {
    if (!payload?.id) return;
    canvasBus.emit(TIMELINE_INTENTS.GROUP_CREATE, payload);
}

export function timelineIntentGroupDelete(payload) {
    if (!payload?.id) return;
    canvasBus.emit(TIMELINE_INTENTS.GROUP_DELETE, payload);
}

export function timelineIntentGroupLockToggle(payload) {
    if (!payload?.id) return;
    canvasBus.emit(TIMELINE_INTENTS.GROUP_LOCK_TOGGLE, payload);
}

export function timelineIntentGroupCollapseToggle(payload) {
    if (!payload?.id) return;
    canvasBus.emit(TIMELINE_INTENTS.GROUP_COLLAPSE_TOGGLE, payload);
}

export function timelineIntentGroupTrackAssign(payload) {
    if (!payload?.groupId || !payload?.trackId) return;
    canvasBus.emit(TIMELINE_INTENTS.GROUP_TRACK_ASSIGN, payload);
}

export function timelineIntentGroupTrackUnassign(payload) {
    if (!payload?.groupId || !payload?.trackId) return;
    canvasBus.emit(TIMELINE_INTENTS.GROUP_TRACK_UNASSIGN, payload);
}

export function timelineIntentAdd(payload) {
    if (!payload) return;
    canvasBus.emit('intent.timeline.add', payload);
}

export function timelineIntentUpdate(payload) {
    if (!payload) return;
    canvasBus.emit('intent.timeline.update', payload);
}

export function timelineIntentRemove(payload) {
    if (!payload) return;
    canvasBus.emit('intent.timeline.remove', payload);
}

export function timelineIntentKeyframeCreate(payload) {
    if (!payload) return;
    canvasBus.emit('intent.keyframe.create', payload);
}

export function timelineIntentKeyframeMove(payload) {
    if (!payload?.keyframeId || payload?.time == null) return;
    canvasBus.emit('intent.keyframe.move', payload);
}

export function timelineIntentKeyframeUpdate(payload) {
    if (!payload?.keyframeId || !payload?.patch) return;
    canvasBus.emit('intent.keyframe.update', payload);
}

export function timelineIntentKeyframeDelete(payload) {
    if (!payload?.keyframeId || (!payload?.clipId && !payload?.trackId)) return;
    canvasBus.emit('intent.keyframe.delete', payload);
}

export function timelineIntentKeyframesUpdate(payload) {
    const clipId = payload?.clipId;
    const trackId = payload?.trackId;
    const keyframeIds = Array.isArray(payload?.keyframeIds) ? payload.keyframeIds : [];
    const patch = payload?.patch;
    if (!patch || !keyframeIds.length || (!clipId && !trackId)) return;

    for (const keyframeId of keyframeIds) {
        timelineIntentKeyframeUpdate({
            clipId,
            trackId,
            keyframeId,
            patch,
        });
    }
}

export function timelineIntentKeyframesOffset(payload) {
    const clipId = payload?.clipId;
    const trackId = payload?.trackId;
    const keyframes = Array.isArray(payload?.keyframes) ? payload.keyframes : [];
    const delta = Number(payload?.delta ?? 0);
    if (!keyframes.length || (!clipId && !trackId) || !Number.isFinite(delta)) return;

    for (const keyframe of keyframes) {
        const time = Number(keyframe?.time ?? 0) + delta;
        timelineIntentKeyframeUpdate({
            clipId,
            trackId,
            keyframeId: keyframe?.id,
            patch: { time },
        });
    }
}

export function timelineIntentKeyframesReverseSpan(payload) {
    const clipId = payload?.clipId;
    const trackId = payload?.trackId;
    const keyframes = Array.isArray(payload?.keyframes) ? payload.keyframes : [];
    if (keyframes.length < 2 || (!clipId && !trackId)) return;

    const times = keyframes.map((keyframe) => Number(keyframe?.time ?? 0));
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    for (const keyframe of keyframes) {
        const currentTime = Number(keyframe?.time ?? 0);
        const time = maxTime - (currentTime - minTime);
        timelineIntentKeyframeUpdate({
            clipId,
            trackId,
            keyframeId: keyframe?.id,
            patch: { time },
        });
    }
}

export function timelineIntentClockSeek(payload) {
    if (!Number.isFinite(payload?.time)) return;
    canvasBus.emit('intent.clock.seek', payload);
}

export function timelineIntentClockPlay() {
    canvasBus.emit('intent.clock.play', {});
}

export function timelineIntentClockPause() {
    canvasBus.emit('intent.clock.pause', {});
}

export function timelineIntentShotSetActive(payload) {
    shotEditorIntentSetActive(payload);
}

export function timelineIntentSequenceCreate(payload) {
    if (!payload?.sequence?.id) return;
    canvasBus.emit('intent.sequence.create', payload);
}

export function timelineIntentSequenceSetActive(payload) {
    if (!payload?.sequenceId) return;
    canvasBus.emit('intent.sequence.setActive', payload);
}

export function timelineIntentSequenceTrackCreate(payload) {
    if (!payload?.sequenceId || !payload?.track?.id) return;
    canvasBus.emit('intent.sequence.track.create', payload);
}

export function timelineIntentSequenceClipCreate(payload) {
    if (!payload?.sequenceId || !payload?.trackId || !payload?.clip?.id) return;
    canvasBus.emit('intent.sequence.clip.create', payload);
}

export function timelineIntentSequenceClipUpdate(payload) {
    if (!payload?.sequenceId || !payload?.trackId || !payload?.clipId || !payload?.patch) return;
    canvasBus.emit('intent.sequence.clip.update', payload);
}

export function timelineIntentSequenceClipDelete(payload) {
    if (!payload?.sequenceId || !payload?.trackId || !payload?.clipId) return;
    canvasBus.emit('intent.sequence.clip.delete', payload);
}

export function timelineIntentSequenceClipMove(payload) {
    if (!payload?.sequenceId || !payload?.trackId || !payload?.clipId) return;
    if (!Number.isFinite(payload?.start) || !Number.isFinite(payload?.end)) return;
    canvasBus.emit('intent.sequence.clip.move', payload);
}

export function timelineIntentSequenceClipTrim(payload) {
    if (!payload?.sequenceId || !payload?.trackId || !payload?.clipId) return;
    if (!Number.isFinite(payload?.start) && !Number.isFinite(payload?.end)) return;
    canvasBus.emit('intent.sequence.clip.trim', payload);
}

export function timelineIntentSequenceClipSplit(payload) {
    if (!payload?.sequenceId || !payload?.trackId || !payload?.clipId) return;
    if (!Number.isFinite(payload?.splitAt)) return;
    canvasBus.emit('intent.sequence.clip.split', {
        ...payload,
        rightClipId: payload?.rightClipId ?? createUuid(),
    });
}
