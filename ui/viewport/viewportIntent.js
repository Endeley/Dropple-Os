import { canvasBus } from '../eventBus/canvasBus.js';

export function viewportIntent(payload) {
    if (!payload?.viewport) return;
    canvasBus.emit('intent.viewport.set', payload);
}
