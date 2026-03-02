import { canvasBus } from '../eventBus/canvasBus.js';

export function nodeUpdateIntent(event) {
    if (!event?.type || !event.type.startsWith('node.')) return;
    canvasBus.emit('intent.node.update', { event });
}
