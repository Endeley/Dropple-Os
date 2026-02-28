import { canvasBus } from '../eventBus/canvasBus.js';
import { createNodeCreateEvent } from '@/runtime/input/nodeCreateRuntimeBridge.js';

let _unsub = null;

export function registerNodeCreateBridge(dispatch) {
    if (_unsub) return _unsub;

    const handler = (intent) => {
        const result = createNodeCreateEvent(intent);
        if (!result) return;

        if (process.env.NODE_ENV === 'development' && !result.projectionOk) {
            console.warn(
                '[Skeleton v2] Node cannot project to canonical Node contract',
                result.event?.payload?.node
            );
        }

        if (typeof dispatch === 'function') {
            dispatch(result.event);
        } else {
            console.warn('[nodeCreateBridge] Dispatch not provided; skipping node create.');
        }
    };

    _unsub = canvasBus.on('intent.node.create', handler);
    return _unsub;
}
