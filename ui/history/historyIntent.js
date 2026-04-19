import { canvasBus } from '../eventBus/canvasBus.js';

export function historyIntentUndo() {
    canvasBus.emit('intent.history.undo', {});
}

export function historyIntentRedo() {
    canvasBus.emit('intent.history.redo', {});
}

export function historyIntentSeek(cursorIndex) {
    if (!Number.isInteger(cursorIndex) || cursorIndex < -1) return;
    canvasBus.emit('intent.history.seek', { cursorIndex });
}
