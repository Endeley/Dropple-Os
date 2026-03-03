import { canvasBus } from '../eventBus/canvasBus.js';
let registered = false;

export function registerNodeUpdateBridge(dispatcher) {
    if (registered) return () => {};
    registered = true;
    const dispatch = dispatcher?.dispatch;

    const handler = (intent) => {
        const event = intent?.event;
        if (!event?.type || !event.type.startsWith('node.')) return;
        if (typeof dispatch === 'function') {
            dispatch(event);
        } else {
            console.warn('[nodeUpdateBridge] Dispatcher not provided; skipping node update.');
        }
    };

    canvasBus.on('intent.node.update', handler);

    return () => {
        canvasBus.off('intent.node.update', handler);
        registered = false;
    };
}
