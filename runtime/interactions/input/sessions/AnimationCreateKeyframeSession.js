import { nanoid } from 'nanoid';
import { EventTypes } from '@/core/events/eventTypes.js';

export class AnimationCreateKeyframeSession {
    constructor({ dispatch, trackId, timeMs, value, easing = 'linear' } = {}) {
        if (typeof dispatch !== 'function') {
            throw new Error('[AnimationCreateKeyframeSession] dispatch required');
        }
        if (!trackId || typeof timeMs !== 'number') {
            throw new Error('[AnimationCreateKeyframeSession] trackId and timeMs required');
        }
        if (typeof value !== 'number') {
            throw new Error('[AnimationCreateKeyframeSession] value must be a number');
        }

        this.id = nanoid();
        this.type = 'animation-keyframe-create';
        this.dispatch = dispatch;
        this.keyframeId = nanoid();
        this.trackId = trackId;
        this.timeMs = timeMs;
        this.value = value;
        this.easing = easing;
    }

    start() {}

    update() {}

    getPreview() {
        return null;
    }

    commit() {
        const event = {
            type: EventTypes.ANIMATION_KEYFRAME_CREATE,
            payload: {
                keyframe: {
                    id: this.keyframeId,
                    trackId: this.trackId,
                    timeMs: this.timeMs,
                    value: this.value,
                    easing: this.easing,
                },
            },
        };

        this.dispatch(event);
        return event;
    }

    cancel() {}
}
