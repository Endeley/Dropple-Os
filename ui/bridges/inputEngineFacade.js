import { handleInputEvent as routeInputEvent } from '@/runtime/input/inputEngine.js';

export function handleInputEvent(input, options) {
    return routeInputEvent(input, options);
}
