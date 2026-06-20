import { canvasBus } from '../eventBus/canvasBus.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { createNodeUpdateBridgeEvent } from '@/ui/bridges/intentEventFacade.js';
import { resolveBridgeDispatch } from '@/ui/bridges/resolveBridgeDispatch.js';
let registered = false;
let activeDispatch = null;
let activeRegistrations = 0;

export function registerNodeUpdateBridge(dispatcherOrDispatch) {
    activeDispatch = resolveBridgeDispatch(dispatcherOrDispatch);
    activeRegistrations += 1;

    const handler = (intent) => {
        const result = createNodeUpdateBridgeEvent(intent);
        if (!result?.event) return;

        if (result.event.type === 'node/delete') {
            useAnimatedRuntimeStore.setState(
                {
                    previewNodes: {},
                    cameraTransform: null,
                },
                false,
            );
        }
        if (typeof activeDispatch === 'function') {
            activeDispatch(result.event);
        } else {
            console.warn('[nodeUpdateBridge] Dispatcher not provided; skipping node update.');
        }
    };

    if (!registered) {
        canvasBus.on('intent.node.update', handler);
        registered = true;
    }

    return () => {
        activeRegistrations = Math.max(0, activeRegistrations - 1);
        if (activeRegistrations === 0) {
            canvasBus.off('intent.node.update', handler);
            activeDispatch = null;
            registered = false;
        }
    };
}
