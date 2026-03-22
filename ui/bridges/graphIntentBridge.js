import { canvasBus } from '../eventBus/canvasBus.js';

let registered = false;

export function emitGraphIntent(event) {
    if (!event?.type) return;
    canvasBus.emit('intent.graph.event', { event });
}

export function registerGraphIntentBridge(dispatcher) {
    if (registered) return () => {};
    registered = true;

    const dispatch = dispatcher?.dispatch ?? dispatcher;

    const onGraphEvent = (payload) => {
        if (!payload?.event?.type || typeof dispatch !== 'function') return;
        dispatch(payload.event);
    };

    canvasBus.on('intent.graph.event', onGraphEvent);

    return () => {
        canvasBus.off('intent.graph.event', onGraphEvent);
        registered = false;
    };
}
