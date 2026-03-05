import { canvasBus } from '../eventBus/canvasBus.js';

export function viewportIntent(payload) {
    if (!payload) return;
    if (payload.type === 'pan') {
        canvasBus.emit('intent.viewport.pan', payload);
        return;
    }
    if (payload.type === 'zoom') {
        canvasBus.emit('intent.viewport.zoom', payload);
        return;
    }
    if (payload.type === 'fit') {
        canvasBus.emit('intent.viewport.fit', payload);
        return;
    }
    if (payload.type === 'center') {
        canvasBus.emit('intent.viewport.center', payload);
        return;
    }
    if (!payload?.viewport) return;
    canvasBus.emit('intent.viewport.set', payload);
}
