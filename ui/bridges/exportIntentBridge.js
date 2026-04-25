import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { EXPORT_INTENTS } from '@/ui/export/exportIntent.js';

let registered = false;
let activeDispatcher = null;
let activeRegistrations = 0;

function dispatch() {
    return activeDispatcher?.dispatch ?? null;
}

export function registerExportIntentBridge(dispatcher) {
    activeDispatcher = dispatcher ?? null;
    activeRegistrations += 1;

    const onTargetUpsert = (payload) =>
        dispatch()?.({
            type: EventTypes.EXPORT_TARGET_UPSERT,
            payload: {
                target: payload?.target,
            },
        });

    const onTargetDelete = (payload) =>
        dispatch()?.({
            type: EventTypes.EXPORT_TARGET_DELETE,
            payload: {
                targetId: payload?.targetId ?? null,
            },
        });

    if (!registered) {
        canvasBus.on(EXPORT_INTENTS.TARGET_UPSERT, onTargetUpsert);
        canvasBus.on(EXPORT_INTENTS.TARGET_DELETE, onTargetDelete);
        registered = true;
    }

    return () => {
        activeRegistrations = Math.max(0, activeRegistrations - 1);
        if (activeRegistrations === 0) {
            canvasBus.off(EXPORT_INTENTS.TARGET_UPSERT, onTargetUpsert);
            canvasBus.off(EXPORT_INTENTS.TARGET_DELETE, onTargetDelete);
            activeDispatcher = null;
            registered = false;
        }
    };
}
