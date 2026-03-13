import { createNodeCreateEvent } from '@/runtime/input/nodeCreateRuntimeBridge.js';
import { createLayoutConvertEvent } from '@/runtime/input/layoutConvertRuntimeBridge.js';
import { createEditEvent } from '@/runtime/input/editEventRuntimeBridge.js';
import { createAnimationKeyframeEvent } from '@/runtime/input/animationKeyframeRuntimeBridge.js';

export function createNodeCreateBridgeEvent(intent) {
    return createNodeCreateEvent(intent);
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
