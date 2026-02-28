import { canvasBus } from '../eventBus/canvasBus.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { getNearestSnapshot } from '@/runtime/input/spatial/nearestSnapshot.js';
import {
    createGroupMoveSession,
    createGroupResizeSession,
} from '@/runtime/input/groupSessionRuntimeBridge.js';

let _unsubMove = null;
let _unsubResize = null;

export function registerGroupSessionBridge() {
    if (_unsubMove || _unsubResize) return;

    _unsubMove = canvasBus.on(
        'intent.group.move.start',
        ({ nodeIds, pointer, modifiers, originalEvent }) => {
            const runtime = useRuntimeStore.getState();
            const animated = useAnimatedRuntimeStore.getState();

            const session = createGroupMoveSession({
                nodeIds,
                pointer,
                modifiers,
                nodesById: runtime?.nodes || {},
                animatedNodesById: animated?.nodes || {},
                nearestSnapshot: getNearestSnapshot?.(),
                zoomTier: 'normal',
            });

            if (!session) return;

            canvasBus.emit('pointer.down', { session, event: originalEvent });
        }
    );

    _unsubResize = canvasBus.on(
        'intent.group.resize.start',
        ({ nodeIds, pointer, handle, modifiers, originalEvent }) => {
            const runtime = useRuntimeStore.getState();

            const session = createGroupResizeSession({
                nodeIds,
                pointer,
                handle,
                modifiers,
                nodesById: runtime?.nodes || {},
            });

            if (!session) return;

            canvasBus.emit('pointer.down', { session, event: originalEvent });
        }
    );
}
