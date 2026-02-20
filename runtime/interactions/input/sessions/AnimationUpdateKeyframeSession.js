import { nanoid } from 'nanoid';
import { EventTypes } from '@/core/events/eventTypes.js';

export class AnimationUpdateKeyframeSession {
    constructor({ dispatch, keyframeId, patch } = {}) {
        if (typeof dispatch !== 'function') {
            throw new Error('[AnimationUpdateKeyframeSession] dispatch required');
        }
        if (!keyframeId || !patch) {
            throw new Error('[AnimationUpdateKeyframeSession] keyframeId and patch required');
        }

        this.id = nanoid();
        this.type = 'animation-keyframe-update';
        this.dispatch = dispatch;
        this.keyframeId = keyframeId;
        this.patch = patch;
    }

    start() {}

    update() {}

    getPreview() {
        return null;
    }

    commit() {
        const event = {
            type: EventTypes.ANIMATION_KEYFRAME_UPDATE,
            payload: {
                keyframeId: this.keyframeId,
                patch: this.patch,
            },
        };

        this.dispatch(event);
        return event;
    }

    cancel() {}
}
