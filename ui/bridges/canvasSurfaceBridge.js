import { canvasBus } from '../eventBus/canvasBus.js';
import { EventTypes } from '@/core/events/eventTypes.js';

let registered = false;

export function registerCanvasSurfaceBridge(dispatch) {
    if (registered) return () => {};
    registered = true;

    const onSetSurface = (intent) => {
        const surface = intent?.surface;
        if (!surface) return;
        if (typeof dispatch === 'function') {
            dispatch({
                type: EventTypes.WORKSPACE_SET_CANVAS_SURFACE,
                payload: { surface },
            });
        } else {
            console.warn(
                '[canvasSurfaceBridge] Dispatch not provided; skipping canvas surface intent.'
            );
        }
    };

    canvasBus.on('intent.workspace.canvasSurface.set', onSetSurface);

    return () => {
        canvasBus.off('intent.workspace.canvasSurface.set', onSetSurface);
        registered = false;
    };
}
