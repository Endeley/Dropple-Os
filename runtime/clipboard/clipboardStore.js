import { EventTypes } from '@/core/events/eventTypes.js';

export function setClipboard(dispatcher, clipboard) {
    if (!dispatcher?.dispatch) return null;

    return dispatcher.dispatch({
        type: EventTypes.CLIPBOARD_SET,
        payload: { clipboard },
    });
}

export function clearClipboard(dispatcher) {
    if (!dispatcher?.dispatch) return null;

    return dispatcher.dispatch({
        type: EventTypes.CLIPBOARD_CLEAR,
    });
}

export function getClipboard(runtime) {
    return runtime?.clipboard ?? { nodes: [], rootIds: [] };
}
