import { canvasBus } from '../eventBus/canvasBus.js';

let registered = false;

export function registerHistoryBridge(dispatcher) {
    if (registered) return () => {};
    registered = true;

    const onUndo = () => {
        if (dispatcher?.undo) {
            dispatcher.undo();
        } else {
            console.warn('[historyBridge] undo unavailable');
        }
    };

    const onRedo = () => {
        if (dispatcher?.redo) {
            dispatcher.redo();
        } else {
            console.warn('[historyBridge] redo unavailable');
        }
    };

    const onSeek = ({ cursorIndex }) => {
        // ✅ Correct place for validation (bridge layer)
        if (!Number.isInteger(cursorIndex)) return;
        if (cursorIndex < -1) return;

        if (dispatcher?.seek) {
            dispatcher.seek(cursorIndex);
        } else {
            console.warn('[historyBridge] seek unavailable');
        }
    };

    canvasBus.on('intent.history.undo', onUndo);
    canvasBus.on('intent.history.redo', onRedo);
    canvasBus.on('intent.history.seek', onSeek);

    return () => {
        canvasBus.off('intent.history.undo', onUndo);
        canvasBus.off('intent.history.redo', onRedo);
        canvasBus.off('intent.history.seek', onSeek);
        registered = false;
    };
}
