import { nanoid } from 'nanoid';
import { EventTypes } from '@/core/events/eventTypes.js';

export class AnimationCreateTrackSession {
    constructor({ dispatch, clipId, nodeId, property } = {}) {
        if (typeof dispatch !== 'function') {
            throw new Error('[AnimationCreateTrackSession] dispatch required');
        }
        if (!clipId || !nodeId || !property) {
            throw new Error('[AnimationCreateTrackSession] clipId, nodeId, property required');
        }

        this.id = nanoid();
        this.type = 'animation-track-create';
        this.dispatch = dispatch;
        this.trackId = nanoid();
        this.clipId = clipId;
        this.nodeId = nodeId;
        this.property = property;
    }

    start() {}

    update() {}

    getPreview() {
        return null;
    }

    commit() {
        const event = {
            type: EventTypes.ANIMATION_TRACK_CREATE,
            payload: {
                track: {
                    id: this.trackId,
                    clipId: this.clipId,
                    nodeId: this.nodeId,
                    property: this.property,
                    keyframeIds: [],
                },
            },
        };

        this.dispatch(event);
        return event;
    }

    cancel() {}
}
