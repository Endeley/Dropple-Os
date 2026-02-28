import { canvasBus } from '../eventBus/canvasBus.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { createSessionFromIntent } from '@/runtime/input/sessionRuntimeBridge.js';

let _unsub = null;

export function registerSessionBridge() {
    if (_unsub) return _unsub;

    const handler = ({ sessionType, payload, originalEvent }) => {
        const runtimeState = useRuntimeStore.getState();
        const nodesById = runtimeState?.nodes || {};

        const session = createSessionFromIntent({
            sessionType,
            payload,
            nodesById,
        });

        if (!session) return;

        canvasBus.emit('pointer.down', {
            session,
            event: originalEvent,
        });
    };

    _unsub = canvasBus.on('intent.session.start', handler);
    return _unsub;
}
