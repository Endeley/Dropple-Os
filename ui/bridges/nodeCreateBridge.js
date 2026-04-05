import { canvasBus } from '../eventBus/canvasBus.js';
import { createNodeCreateBridgeEvent } from '@/ui/bridges/intentEventFacade.js';

let registered = false;
let activeDispatch = null;
let activeRegistrations = 0;

export function registerNodeCreateBridge(dispatch) {
    activeDispatch = dispatch ?? null;
    activeRegistrations += 1;

    const handler = (intent) => {
        console.log('BRIDGE RECEIVED:', intent);
        const result = createNodeCreateBridgeEvent(intent);
        if (!result) return;

        if (process.env.NODE_ENV === 'development' && !result.projectionOk) {
            console.warn(
                '[Skeleton v2] Node cannot project to canonical Node contract',
                result.event?.payload?.node
            );
        }

        if (typeof activeDispatch === 'function') {
            activeDispatch(result.event);
        } else {
            console.warn('[nodeCreateBridge] Dispatch not provided; skipping node create.');
        }
    };

    if (!registered) {
        canvasBus.on('intent.node.create', handler);
        registered = true;
    }

    return () => {
        activeRegistrations = Math.max(0, activeRegistrations - 1);
        if (activeRegistrations === 0) {
            canvasBus.off('intent.node.create', handler);
            activeDispatch = null;
            registered = false;
        }
    };
}
