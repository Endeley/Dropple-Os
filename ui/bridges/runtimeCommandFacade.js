import { canvasBus } from '@/ui/eventBus/canvasBus.js';

export function runCommandIntent(commandId, payload = {}) {
    if (typeof commandId !== 'string' || commandId.length === 0) return null;

    canvasBus.emit('intent.command.run', {
        commandId,
        payload,
    });

    return { handled: true };
}
