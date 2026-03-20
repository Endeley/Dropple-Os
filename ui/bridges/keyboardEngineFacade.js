import { handleKeyboardEvent as routeKeyboardEvent } from '@/runtime/input/keyboardEngine.js';

export function handleKeyboardEvent(event, options) {
    return routeKeyboardEvent(event, options);
}
