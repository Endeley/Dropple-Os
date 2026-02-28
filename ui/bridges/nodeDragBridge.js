import { canvasBus } from '../eventBus/canvasBus.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { useSelectionStore } from '@/runtime/stores/useSelectionStore.js';
import { getNearestSnapshot } from '@/runtime/input/spatial/nearestSnapshot.js';
import { createNodeDragSessionIntent } from '@/runtime/input/nodeDragRuntimeBridge.js';

let _unsub = null;

export function registerNodeDragBridge() {
    if (_unsub) return _unsub;

    const handler = (intent) => {
        const selectionState = useSelectionStore.getState();
        const runtime = useRuntimeStore.getState();
        const animated = useAnimatedRuntimeStore.getState();

        const nodesById = runtime?.nodes && Object.keys(runtime.nodes).length > 0
            ? runtime.nodes
            : animated?.nodes || {};

        const result = createNodeDragSessionIntent({
            intent,
            selectedIds: selectionState.selectedIds,
            nodesById,
            nearestSnapshot: getNearestSnapshot?.(),
            zoomTier: intent?.zoomTier ?? 'normal',
        });

        if (!result) return;

        if (Array.isArray(result.nextSelectedIds)) {
            selectionState.setSelectedIds(result.nextSelectedIds);
        }

        if (result.sessionIntent) {
            canvasBus.emit('intent.session.start', result.sessionIntent);
        }
    };

    _unsub = canvasBus.on('intent.node.pointerDown', handler);
    return _unsub;
}
