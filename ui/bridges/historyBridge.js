import { canvasBus } from '../eventBus/canvasBus.js';
let registered = false;

export function registerHistoryBridge(dispatcher) {
    if (registered) return () => {};
    registered = true;

    const onUndo = () => {
        if (dispatcher?.undo) {
            dispatcher.undo();
        } else {
            console.warn('[historyBridge] Dispatcher not provided; skipping history undo.');
        }
    };
    const onRedo = () => {
        if (dispatcher?.redo) {
            dispatcher.redo();
        } else {
            console.warn('[historyBridge] Dispatcher not provided; skipping history redo.');
        }
    };

    canvasBus.on('intent.history.undo', onUndo);
    canvasBus.on('intent.history.redo', onRedo);

    return () => {
        canvasBus.off('intent.history.undo', onUndo);
        canvasBus.off('intent.history.redo', onRedo);
        registered = false;
    };
}
