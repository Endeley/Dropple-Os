import { canvasBus } from '../eventBus/canvasBus.js';
import {
    VIEWPORT_PAN,
    VIEWPORT_ZOOM,
    VIEWPORT_FIT,
    VIEWPORT_CENTER,
} from '@/core/events/viewportEvents.js';
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
                payload: viewport,
            });
        } else {
            console.warn('[viewportBridge] Dispatcher not provided; skipping viewport intent.');
        }
    };

    const onViewportPan = (intent) => {
        if (typeof dispatch !== 'function') {
            console.warn('[viewportBridge] Dispatcher not provided; skipping viewport pan intent.');
            return;
        }
        dispatch({
            type: VIEWPORT_PAN,
            payload: { dx: intent?.dx ?? 0, dy: intent?.dy ?? 0 },
        });
    };

    const onViewportZoom = (intent) => {
        if (typeof dispatch !== 'function') {
            console.warn('[viewportBridge] Dispatcher not provided; skipping viewport zoom intent.');
            return;
        }
        dispatch({
            type: VIEWPORT_ZOOM,
            payload: { scale: intent?.scale ?? 1, anchor: intent?.anchor ?? null },
        });
    };

    const onViewportFit = (intent) => {
        if (typeof dispatch !== 'function') {
            console.warn('[viewportBridge] Dispatcher not provided; skipping viewport fit intent.');
            return;
        }
        dispatch({
            type: VIEWPORT_FIT,
            payload: intent?.payload ?? null,
        });
    };

    const onViewportCenter = (intent) => {
        if (typeof dispatch !== 'function') {
            console.warn('[viewportBridge] Dispatcher not provided; skipping viewport center intent.');
            return;
        }
        dispatch({
            type: VIEWPORT_CENTER,
            payload: intent?.payload ?? null,
        });
    };

    canvasBus.on('intent.viewport.set', onViewportSet);
    canvasBus.on('intent.viewport.pan', onViewportPan);
    canvasBus.on('intent.viewport.zoom', onViewportZoom);
    canvasBus.on('intent.viewport.fit', onViewportFit);
    canvasBus.on('intent.viewport.center', onViewportCenter);

    return () => {
        canvasBus.off('intent.viewport.set', onViewportSet);
        canvasBus.off('intent.viewport.pan', onViewportPan);
        canvasBus.off('intent.viewport.zoom', onViewportZoom);
        canvasBus.off('intent.viewport.fit', onViewportFit);
        canvasBus.off('intent.viewport.center', onViewportCenter);
        registered = false;
    };
}
