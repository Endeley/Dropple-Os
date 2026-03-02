import { canvasBus } from '../eventBus/canvasBus.js';

export function canvasSurfaceIntentSet(payload) {
    if (!payload?.surface) return;
    canvasBus.emit('intent.workspace.canvasSurface.set', payload);
}
