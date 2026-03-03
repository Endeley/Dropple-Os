import { canvasBus } from '../eventBus/canvasBus.js';
import { EventTypes } from '@/core/events/eventTypes.js';

let registered = false;

export function registerViewportBridge(dispatcher) {
    if (registered) return () => {};
    registered = true;
    const dispatch = dispatcher?.dispatch;

    const onViewportSet = (intent) => {
        const viewport = intent?.viewport;
        if (!viewport) return;
        if (typeof dispatch === 'function') {
            dispatch({
                type: EventTypes.WORKSPACE_SET_VIEWPORT,
                payload: { viewport },
            });
        } else {
            console.warn('[viewportBridge] Dispatcher not provided; skipping viewport intent.');
        }
    };

    canvasBus.on('intent.viewport.set', onViewportSet);

    return () => {
        canvasBus.off('intent.viewport.set', onViewportSet);
        registered = false;
    };
}
