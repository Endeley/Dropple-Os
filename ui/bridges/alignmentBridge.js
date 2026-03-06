import { canvasBus } from '../eventBus/canvasBus.js';
import { EventTypes } from '@/core/events/eventTypes.js';

let registered = false;

export function registerAlignmentBridge(dispatcher) {
    if (registered) return () => {};
    registered = true;

    const dispatch = dispatcher?.dispatch;

    const onAlign = (intent) => {
        const alignment = intent?.alignment;
        const nodeIds = Array.isArray(intent?.nodeIds) ? intent.nodeIds : [];
        if (!alignment || nodeIds.length < 2) return;
        if (typeof dispatch === 'function') {
            dispatch({
                type: EventTypes.ALIGN_NODES,
                payload: { alignment, nodeIds },
            });
        } else {
            console.warn('[alignmentBridge] Dispatcher not provided; skipping align.');
        }
    };

    const onDistribute = (intent) => {
        const axis = intent?.axis;
        const nodeIds = Array.isArray(intent?.nodeIds) ? intent.nodeIds : [];
        if (!axis || nodeIds.length < 3) return;
        if (typeof dispatch === 'function') {
            dispatch({
                type: EventTypes.DISTRIBUTE_NODES,
                payload: { axis, nodeIds },
            });
        } else {
            console.warn('[alignmentBridge] Dispatcher not provided; skipping distribute.');
        }
    };

    canvasBus.on('intent.align', onAlign);
    canvasBus.on('intent.distribute', onDistribute);

    return () => {
        canvasBus.off('intent.align', onAlign);
        canvasBus.off('intent.distribute', onDistribute);
        registered = false;
    };
}
