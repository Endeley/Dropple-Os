import { nanoid } from 'nanoid';
import { EventTypes } from '@/core/events/eventTypes.js';

export class AnimationDeleteKeyframeSession {
    constructor({ dispatch, keyframeId } = {}) {
        if (typeof dispatch !== 'function') {
            throw new Error('[AnimationDeleteKeyframeSession] dispatch required');
        }
        if (!keyframeId) {
            throw new Error('[AnimationDeleteKeyframeSession] keyframeId required');
        }

        this.id = nanoid();
        this.type = 'animation-keyframe-delete';
        this.dispatch = dispatch;
        this.keyframeId = keyframeId;
    }

    start() {}

    update() {}

    getPreview() {
        return null;
    }

    commit() {
        const event = {
            type: EventTypes.ANIMATION_KEYFRAME_DELETE,
            payload: {
                keyframeId: this.keyframeId,
            },
        };

        this.dispatch(event);
        return event;
    }

    cancel() {}
}
