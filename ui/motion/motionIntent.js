'use client';

import { canvasBus } from '@/ui/eventBus/canvasBus.js';

export function motionIntentKeyframeUpdate(payload) {
    if (!payload?.clipId || !payload?.keyframeId || !payload?.patch) return;
    canvasBus.emit('intent.motion.keyframe.update', payload);
}

export function motionIntentKeyframeDelete(payload) {
    if (!payload?.clipId || !payload?.keyframeId) return;
    canvasBus.emit('intent.motion.keyframe.delete', payload);
}
