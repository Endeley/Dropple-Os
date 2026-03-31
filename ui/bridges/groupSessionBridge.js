import { canvasBus } from '../eventBus/canvasBus.js';
import {
    createGroupMoveBridgeSession,
    createGroupResizeBridgeSession,
} from '@/ui/bridges/interactionSessionBridge.js';

let _unsubMove = null;
let _unsubResize = null;

export function registerGroupSessionBridge() {
    if (_unsubMove || _unsubResize) return;

    _unsubMove = canvasBus.on(
        'intent.group.move.start',
        ({ nodeIds, pointer, modifiers, originalEvent }) => {
            const session = createGroupMoveBridgeSession({
                nodeIds,
                pointer,
                modifiers,
                zoomTier: 'normal',
            });

            if (!session) return;

            canvasBus.emit('pointer.down', { session, event: originalEvent });
        }
    );

    _unsubResize = canvasBus.on(
        'intent.group.resize.start',
        ({ nodeIds, pointer, handle, modifiers, originalEvent }) => {
            const session = createGroupResizeBridgeSession({
                nodeIds,
                pointer,
                handle,
                modifiers,
            });

            if (!session) return;

            canvasBus.emit('pointer.down', { session, event: originalEvent });
        }
    );
}
