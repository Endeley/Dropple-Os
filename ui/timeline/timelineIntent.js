import { canvasBus } from '../eventBus/canvasBus.js';

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
    if (!payload?.shotId) return;
    canvasBus.emit('intent.shot.setActive', payload);
}
