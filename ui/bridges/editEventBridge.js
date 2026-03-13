import { canvasBus } from '../eventBus/canvasBus.js';
import { createEditBridgeEvent } from '@/ui/bridges/intentEventFacade.js';

let registered = false;

export function registerEditEventBridge(dispatch) {
    if (registered) return () => {};
    registered = true;

    const onCommit = (intent) => {
        const event = createEditBridgeEvent(intent);
        if (!event) return;
        if (typeof dispatch === 'function') {
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
