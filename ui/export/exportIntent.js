import { canvasBus } from '@/ui/eventBus/canvasBus.js';

export const EXPORT_INTENTS = Object.freeze({
    TARGET_UPSERT: 'intent.export.target.upsert',
    TARGET_DELETE: 'intent.export.target.delete',
});

export function exportIntentTargetUpsert(payload) {
    if (!payload?.target) return;
    canvasBus.emit(EXPORT_INTENTS.TARGET_UPSERT, payload);
}

export function exportIntentTargetDelete(payload) {
    if (!payload?.targetId) return;
    canvasBus.emit(EXPORT_INTENTS.TARGET_DELETE, payload);
}
