import { canvasBus } from '../eventBus/canvasBus.js';
import { createSessionBridgeSession } from '@/ui/bridges/interactionSessionBridge.js';

let _unsub = null;

export function registerSessionBridge() {
    if (_unsub) return _unsub;

    const handler = ({ sessionType, payload, originalEvent }) => {
        const session = createSessionBridgeSession({ sessionType, payload });

        if (!session) return;

        canvasBus.emit('pointer.down', {
            session,
            event: originalEvent,
        });
    };

    _unsub = canvasBus.on('intent.session.start', handler);
    return _unsub;
}
