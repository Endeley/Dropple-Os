import { canvasBus } from '../eventBus/canvasBus.js';
import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';

let registered = false;
let warnedMissingDispatcher = false;

function safeDispatch(event) {
    try {
        const dispatcher = getRuntimeDispatcher();
        dispatcher.dispatch(event);
    } catch (err) {
        if (!warnedMissingDispatcher) {
            console.warn('[nodeUpdateBridge] Dispatcher not available; skipping node update.', err);
            warnedMissingDispatcher = true;
        }
    }
}

export function registerNodeUpdateBridge() {
    if (registered) return () => {};
    registered = true;

    const handler = (intent) => {
        const event = intent?.event;
        if (!event?.type || !event.type.startsWith('node.')) return;
        safeDispatch(event);
    };

    canvasBus.on('intent.node.update', handler);

    return () => {
        canvasBus.off('intent.node.update', handler);
        registered = false;
    };
}
