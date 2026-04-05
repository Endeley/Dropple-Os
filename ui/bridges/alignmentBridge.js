import { canvasBus } from '../eventBus/canvasBus.js';
import { EventTypes } from '@/core/events/eventTypes.js';

let registered = false;
let activeDispatch = null;
let activeRegistrations = 0;

export function registerAlignmentBridge(dispatcher) {
    activeDispatch = dispatcher?.dispatch ?? null;
    activeRegistrations += 1;

    const onAlign = (intent) => {
        const alignment = intent?.alignment;
        const nodeIds = Array.isArray(intent?.nodeIds) ? intent.nodeIds : [];
        if (!alignment || nodeIds.length < 2) return;
        if (typeof activeDispatch === 'function') {
            activeDispatch({
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
        if (typeof activeDispatch === 'function') {
            activeDispatch({
                type: EventTypes.DISTRIBUTE_NODES,
                payload: { axis, nodeIds },
            });
        } else {
            console.warn('[alignmentBridge] Dispatcher not provided; skipping distribute.');
        }
    };

    if (!registered) {
        canvasBus.on('intent.align', onAlign);
        canvasBus.on('intent.distribute', onDistribute);
        registered = true;
    }

    return () => {
        activeRegistrations = Math.max(0, activeRegistrations - 1);
        if (activeRegistrations === 0) {
            canvasBus.off('intent.align', onAlign);
            canvasBus.off('intent.distribute', onDistribute);
            activeDispatch = null;
            registered = false;
        }
    };
}
