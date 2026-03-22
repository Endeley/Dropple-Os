import { canvasBus } from '../eventBus/canvasBus.js';
import { setActiveTool } from '@/runtime/actions/toolActions.js';

let registered = false;

export function registerToolIntentBridge(dispatcher) {
    if (registered) return () => {};
    registered = true;

    const dispatch = dispatcher?.dispatch ?? dispatcher;

    const onSetActiveTool = (payload) => {
        const toolId = payload?.toolId ?? null;
        if (!toolId || typeof dispatch !== 'function') return;
        dispatch(setActiveTool(toolId));
    };

    canvasBus.on('intent.tool.setActive', onSetActiveTool);

    return () => {
        canvasBus.off('intent.tool.setActive', onSetActiveTool);
        registered = false;
    };
}
