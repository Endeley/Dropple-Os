import { canvasBus } from '../eventBus/canvasBus.js';
import { createLayoutConvertBridgeEvent } from '@/ui/bridges/intentEventFacade.js';

let registered = false;

export function registerLayoutConvertBridge(dispatcher) {
    if (registered) return () => {};
    registered = true;

    const dispatch = dispatcher?.dispatch;

    const onConvert = (intent) => {
        const event = createLayoutConvertBridgeEvent(intent);
        if (!event) return;
        if (typeof dispatch === 'function') {
            dispatch(event);
        } else {
            console.warn('[layoutConvertBridge] Dispatcher not provided; skipping convert.');
        }
    };

    canvasBus.on('intent.layout.convert', onConvert);

    return () => {
        canvasBus.off('intent.layout.convert', onConvert);
        registered = false;
    };
}
