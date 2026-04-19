import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { INTENTS } from '@/core/intents/intentTypes.js';
import { EventTypes } from '@/core/events/eventTypes.js';

let registered = false;
let activeDispatch = null;
let activeRegistrations = 0;
let unsubscribe = null;

function onSetActiveTool(payload) {
    const toolId = payload?.toolId ?? null;
    if (!toolId) return;
    if (typeof activeDispatch !== 'function') return;

    activeDispatch({
        type: EventTypes.TOOL_SET_ACTIVE,
        payload: { toolId },
    });
}

export function registerToolIntentBridge(dispatcher) {
    // ✅ STRICT: dispatcher is required
    const dispatch = dispatcher?.dispatch;

    if (typeof dispatch !== 'function') {
        console.warn('[toolIntentBridge] Invalid dispatcher passed');
        return () => {};
    }

    activeDispatch = dispatch;
    activeRegistrations += 1;

    if (!registered) {
        unsubscribe = canvasBus.on(INTENTS.TOOL_SET_ACTIVE, onSetActiveTool);
        registered = true;
    }

    return () => {
        activeRegistrations = Math.max(0, activeRegistrations - 1);

        if (activeRegistrations === 0) {
            unsubscribe?.();
            unsubscribe = null;
            activeDispatch = null;
            registered = false;
        }
    };
}
