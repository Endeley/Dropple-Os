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
                '[canvasSurfaceBridge] Dispatcher not available; skipping canvas surface intent.',
                err,
            );
            warnedMissingDispatcher = true;
        }
    }
}

export function registerCanvasSurfaceBridge() {
    if (registered) return () => {};
    registered = true;

    const onSetSurface = (intent) => {
        const surface = intent?.surface;
        if (!surface) return;
        safeDispatch({
            type: EventTypes.WORKSPACE_SET_CANVAS_SURFACE,
            payload: { surface },
        });
    };

    canvasBus.on('intent.workspace.canvasSurface.set', onSetSurface);

    return () => {
        canvasBus.off('intent.workspace.canvasSurface.set', onSetSurface);
        registered = false;
    };
}
