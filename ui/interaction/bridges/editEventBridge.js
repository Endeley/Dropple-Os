import { canvasBus } from '../../eventBus/canvasBus.js';
import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';
import { createEditEvent } from '@/runtime/input/editEventRuntimeBridge.js';

let registered = false;
let warnedMissingDispatcher = false;

function safeDispatch(event) {
    try {
        const dispatcher = getRuntimeDispatcher();
        dispatcher.dispatch(event);
    } catch (err) {
        if (!warnedMissingDispatcher) {
            console.warn(
                '[editEventBridge] Dispatcher not available; skipping timeline event.',
                err
            );
            warnedMissingDispatcher = true;
        }
    }
}

export function registerEditEventBridge() {
    if (registered) return () => {};
    registered = true;

    const onCommit = (intent) => {
        const event = createEditEvent(intent);
        if (!event) return;
        safeDispatch(event);
    };

    canvasBus.on('intent.edit.commit', onCommit);

    return () => {
        canvasBus.off('intent.edit.commit', onCommit);
        registered = false;
    };
}
