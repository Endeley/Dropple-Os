import { canvasBus } from '../eventBus/canvasBus.js';

export function nodeCreateIntent(payload) {
    if (!payload?.type) return;
    canvasBus.emit('intent.node.create', payload);
}
