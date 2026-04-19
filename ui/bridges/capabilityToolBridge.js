import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { handleCapabilityIntent } from '@/runtime/capabilities/toolRegistrationRuntime.js';

let registered = false;
let activeDispatcher = null;
let activeRegistrations = 0;

function onCapabilityToolIntent(event) {
    return handleCapabilityIntent(event, { dispatcher: activeDispatcher });
}

export function registerCapabilityToolBridge(dispatcher) {
    activeDispatcher = dispatcher ?? null;
    activeRegistrations += 1;

    if (!registered) {
        canvasBus.on('capability.tools.register.requested', onCapabilityToolIntent);
        canvasBus.on('capability.tools.unregister.requested', onCapabilityToolIntent);
        registered = true;
    }

    return () => {
        activeRegistrations = Math.max(0, activeRegistrations - 1);

        if (activeRegistrations === 0) {
            canvasBus.off('capability.tools.register.requested', onCapabilityToolIntent);
            canvasBus.off('capability.tools.unregister.requested', onCapabilityToolIntent);
            activeDispatcher = null;
            registered = false;
        }
    };
}
