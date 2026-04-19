import { canvasBus } from '../eventBus/canvasBus.js';
import { createEditBridgeEvent } from '@/ui/bridges/intentEventFacade.js';
import { resolveBridgeDispatch } from '@/ui/bridges/resolveBridgeDispatch.js';

let registered = false;

export function registerEditEventBridge(dispatcherOrDispatch) {
    if (registered) return () => {};
    registered = true;
    const dispatch = resolveBridgeDispatch(dispatcherOrDispatch);

    const onCommit = (intent) => {
        const event = createEditBridgeEvent(intent);
        if (!event) return;
        if (dispatch) {
            dispatch(event);
        } else {
            console.warn(
                '[editEventBridge] Dispatch not provided; skipping timeline event.'
            );
        }
    };

    canvasBus.on('intent.edit.commit', onCommit);

    return () => {
        canvasBus.off('intent.edit.commit', onCommit);
        registered = false;
    };
}
