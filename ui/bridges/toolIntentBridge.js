import { canvasBus } from '../eventBus/canvasBus.js';
import { setActiveTool } from '@/runtime/actions/toolActions.js';

let registered = false;
let activeDispatch = null;
let activeRegistrations = 0;

function onSetActiveTool(payload) {
    const toolId = payload?.toolId ?? null;
    if (!toolId) return;
    if (typeof activeDispatch !== 'function') return;
    activeDispatch(setActiveTool(toolId));
}

export function registerToolIntentBridge(dispatcher) {
    activeDispatch = dispatcher?.dispatch ?? dispatcher ?? null;
    activeRegistrations += 1;

    if (!registered) {
        canvasBus.on('intent.tool.setActive', onSetActiveTool);
        registered = true;
    }

    return () => {
        activeRegistrations = Math.max(0, activeRegistrations - 1);
        if (activeRegistrations === 0) {
            canvasBus.off('intent.tool.setActive', onSetActiveTool);
            activeDispatch = null;
            registered = false;
        }
    };
}
