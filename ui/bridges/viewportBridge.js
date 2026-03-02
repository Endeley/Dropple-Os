import { canvasBus } from '../eventBus/canvasBus.js';
import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';
import { EventTypes } from '@/core/events/eventTypes.js';

let registered = false;
let warnedMissingDispatcher = false;

function safeDispatch(event) {
    try {
        const dispatcher = getRuntimeDispatcher();
        dispatcher.dispatch(event);
    } catch (err) {
        if (!warnedMissingDispatcher) {
            console.warn(
                '[viewportBridge] Dispatcher not available; skipping viewport intent.',
                err,
            );
            warnedMissingDispatcher = true;
        }
    }
}

export function registerViewportBridge() {
    if (registered) return () => {};
    registered = true;

    const onViewportSet = (intent) => {
        const viewport = intent?.viewport;
        if (!viewport) return;
        safeDispatch({
            type: EventTypes.WORKSPACE_SET_VIEWPORT,
            payload: { viewport },
        });
    };

    canvasBus.on('intent.viewport.set', onViewportSet);

    return () => {
        canvasBus.off('intent.viewport.set', onViewportSet);
        registered = false;
    };
}
