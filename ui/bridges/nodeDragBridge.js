import { canvasBus } from '../eventBus/canvasBus.js';
import { SELECTION_SET } from '@/core/events/selectionEvents.js';
import { createNodeDragBridgeResult } from '@/ui/bridges/interactionSessionBridge.js';

let _unsub = null;

export function registerNodeDragBridge(dispatch) {
    if (_unsub) return _unsub;

    const handler = (intent) => {
        const result = createNodeDragBridgeResult({ intent });

        if (!result) return;

        if (Array.isArray(result.nextSelectedIds) && typeof dispatch === 'function') {
            dispatch({ type: SELECTION_SET, payload: { ids: result.nextSelectedIds } });
        }

        if (result.sessionIntent) {
            canvasBus.emit('intent.session.start', result.sessionIntent);
        }
    };

    _unsub = canvasBus.on('intent.node.pointerDown', handler);
    return _unsub;
}
