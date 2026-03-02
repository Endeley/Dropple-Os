import { canvasBus } from '../eventBus/canvasBus.js';

export function workspaceIntentSetActive(payload) {
    if (!payload?.workspaceId && !payload?.id) return;
    canvasBus.emit('intent.workspace.setActive', payload);
}
