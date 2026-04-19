import { INTENTS } from '@/core/intents/intentTypes.js';
import { canvasBus } from '../eventBus/canvasBus.js';

export function workspaceIntentSetActive(payload) {
    if (!payload?.workspaceId && !payload?.id) return;
    canvasBus.emit(INTENTS.WORKSPACE_ACTIVATE, payload);
}
