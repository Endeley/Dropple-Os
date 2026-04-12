import { canvasBus } from '../eventBus/canvasBus.js';
import { shotEditorIntentSetActive } from '@/ui/workspace/editor/shotEditorIntent.js';

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
