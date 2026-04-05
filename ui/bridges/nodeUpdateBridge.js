import { canvasBus } from '../eventBus/canvasBus.js';
let registered = false;
let activeDispatch = null;
let activeRegistrations = 0;

export function registerNodeUpdateBridge(dispatcher) {
    activeDispatch = dispatcher?.dispatch ?? null;
    activeRegistrations += 1;

    const handler = (intent) => {
        const event = intent?.event;
        if (!event?.type || !event.type.startsWith('node.')) return;
        if (typeof activeDispatch === 'function') {
            activeDispatch(event);
        } else {
            console.warn('[nodeUpdateBridge] Dispatcher not provided; skipping node update.');
        }
    };

    if (!registered) {
        canvasBus.on('intent.node.update', handler);
        registered = true;
    }

    return () => {
        activeRegistrations = Math.max(0, activeRegistrations - 1);
        if (activeRegistrations === 0) {
            canvasBus.off('intent.node.update', handler);
            activeDispatch = null;
            registered = false;
        }
    };
}
