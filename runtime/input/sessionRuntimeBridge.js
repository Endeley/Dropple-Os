import { canvasBus } from '@/infrastructure/eventBus/canvasBus.js';
import { MoveSession } from '@/runtime/interactions/input/sessions/MoveSession.js';
import { ResizeSession } from '@/runtime/interactions/input/sessions/ResizeSession.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { registerNodeDragRuntimeBridge } from './nodeDragRuntimeBridge';
import { registerGroupSessionRuntimeBridge } from './groupSessionRuntimeBridge.js';
import { registerNodeCreateRuntimeBridge } from './nodeCreateRuntimeBridge.js';
import { registerAnimationKeyframeRuntimeBridge } from './animationKeyframeRuntimeBridge.js';
import { registerSessionCommitRuntimeBridge } from './sessionCommitRuntimeBridge.js';
import { registerEditEventRuntimeBridge } from './editEventRuntimeBridge.js';

let _unsub = null;

export function registerSessionRuntimeBridge() {
    if (_unsub) return _unsub;

    registerNodeDragRuntimeBridge();
    registerGroupSessionRuntimeBridge();
    registerNodeCreateRuntimeBridge();
    registerAnimationKeyframeRuntimeBridge();
    registerSessionCommitRuntimeBridge();
    registerEditEventRuntimeBridge();

    const handler = ({ sessionType, payload, originalEvent }) => {
        if (!payload) return;

        const runtimeState = useRuntimeStore.getState();
        const nodes = runtimeState?.nodes || {};

        let session = null;

        if (sessionType === 'move') {
            session = new MoveSession({
                nodeIds: payload.nodeIds,
                nodes: payload.nodeIds.map((id) => nodes[id]).filter(Boolean),
                siblings: Object.values(nodes).filter(Boolean),
                canvas: payload.canvas,
                startPointer: payload.startPointer,
                options: payload.options,
            });
        }

        if (sessionType === 'resize') {
            session = new ResizeSession({
                nodeIds: payload.nodeIds,
                nodes: payload.nodeIds.map((id) => nodes[id]).filter(Boolean),
                siblings: Object.values(nodes).filter(Boolean),
                canvas: payload.canvas,
                startPointer: payload.startPointer,
                handle: payload.handle,
                options: payload.options,
            });
        }

        if (!session) return;

        canvasBus.emit('pointer.down', {
            session,
            event: originalEvent,
        });
    };

    _unsub = canvasBus.on('intent.session.start', handler);
    return _unsub;
}
