import { nanoid } from 'nanoid';
import { EventTypes } from '@/core/events/eventTypes.js';

export class AnimationCreateClipSession {
    constructor({ dispatch, clipId = null, durationMs = 0 } = {}) {
        if (typeof dispatch !== 'function') {
            throw new Error('[AnimationCreateClipSession] dispatch required');
        }

        this.id = nanoid();
        this.type = 'animation-clip-create';
        this.dispatch = dispatch;
        this.clipId = clipId || nanoid();
        this.durationMs = durationMs;
    }

    start() {}

    update() {}

    getPreview() {
        return null;
    }

    commit() {
        const event = {
            type: EventTypes.ANIMATION_CLIP_CREATE,
            payload: {
                clip: {
                    id: this.clipId,
                    durationMs: this.durationMs,
                    trackIds: [],
                },
            },
        };

        this.dispatch(event);
        return event;
    }

    cancel() {}
}
