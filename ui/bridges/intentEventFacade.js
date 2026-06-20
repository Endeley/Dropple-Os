import { createNodeCreateEvent } from '@/runtime/input/nodeCreateRuntimeBridge.js';
import { createLayoutConvertEvent } from '@/runtime/input/layoutConvertRuntimeBridge.js';
import { createEditEvent } from '@/runtime/input/editEventRuntimeBridge.js';
import { createAnimationKeyframeEvent } from '@/runtime/input/animationKeyframeRuntimeBridge.js';
import { EventTypes } from '@/core/events/eventTypes.js';

export function createNodeCreateBridgeEvent(intent) {
    return createNodeCreateEvent(intent);
}

export function createNodeUpdateBridgeEvent(intent) {
    const event = intent?.event;
    if (!event?.type) return null;

    const isNodeEvent =
        event.type.startsWith('node.') ||
        event.type.startsWith('node/');

    if (!isNodeEvent) return null;

    if (event.type === 'node.delete') {
        return {
            event: {
                ...event,
                type: EventTypes.NODE_DELETE,
            },
        };
    }

    return { event };
}

export function createLayoutConvertBridgeEvent(intent) {
    return createLayoutConvertEvent(intent);
}

export function createEditBridgeEvent(intent) {
    return createEditEvent(intent);
}

export function createAnimationKeyframeBridgeEvent(intent) {
    return createAnimationKeyframeEvent(intent);
}
