import { handleInputEvent } from './inputEngine.js';

function normalizeKeyboardEvent(event) {
    return {
        type: 'keyboard',
        key: event.key,
        code: event.code,
        repeat: event.repeat,
        modifiers: {
            shift: event.shiftKey,
            ctrl: event.ctrlKey,
            meta: event.metaKey,
            alt: event.altKey,
        },
        event,
    };
}

export function handleKeyboardEvent(event, options = {}) {
    return handleInputEvent(normalizeKeyboardEvent(event), options);
}
