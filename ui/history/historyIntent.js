import { canvasBus } from '../eventBus/canvasBus.js';

export function historyIntentUndo() {
    canvasBus.emit('intent.history.undo', {});
}

export function historyIntentRedo() {
    canvasBus.emit('intent.history.redo', {});
}
