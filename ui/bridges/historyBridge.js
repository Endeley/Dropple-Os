import { canvasBus } from '../eventBus/canvasBus.js';
import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';

let registered = false;
let warnedMissingDispatcher = false;

function getDispatcher() {
    try {
        return getRuntimeDispatcher();
    } catch (err) {
        if (!warnedMissingDispatcher) {
            console.warn('[historyBridge] Dispatcher not available; skipping history intent.', err);
            warnedMissingDispatcher = true;
        }
        return null;
    }
}

export function registerHistoryBridge() {
    if (registered) return () => {};
    registered = true;

    const onUndo = () => {
        const dispatcher = getDispatcher();
        dispatcher?.undo?.();
    };
    const onRedo = () => {
        const dispatcher = getDispatcher();
        dispatcher?.redo?.();
    };

    canvasBus.on('intent.history.undo', onUndo);
    canvasBus.on('intent.history.redo', onRedo);

    return () => {
        canvasBus.off('intent.history.undo', onUndo);
        canvasBus.off('intent.history.redo', onRedo);
        registered = false;
    };
}
