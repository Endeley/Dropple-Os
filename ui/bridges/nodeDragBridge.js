import { canvasBus } from '../eventBus/canvasBus.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { getNearestSnapshot } from '@/runtime/input/spatial/nearestSnapshot.js';
import { createNodeDragSessionIntent } from '@/runtime/input/nodeDragRuntimeBridge.js';
import { SELECTION_SET } from '@/core/events/selectionEvents.js';

let _unsub = null;

export function registerNodeDragBridge(dispatch) {
    if (_unsub) return _unsub;

    const handler = (intent) => {
        const selectionIds = useRuntimeStore.getState().selection?.ids || [];
        const runtime = useRuntimeStore.getState();
        const animated = useAnimatedRuntimeStore.getState();

        const nodesById = runtime?.nodes && Object.keys(runtime.nodes).length > 0
            ? runtime.nodes
            : animated?.nodes || {};

        const result = createNodeDragSessionIntent({
            intent,
            selectedIds: selectionIds,
            nodesById,
            nearestSnapshot: getNearestSnapshot?.(),
            zoomTier: intent?.zoomTier ?? 'normal',
        });

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
