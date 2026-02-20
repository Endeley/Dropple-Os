import { canvasBus } from '@/infrastructure/eventBus/canvasBus.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { MoveSession } from '@/runtime/interactions/input/sessions/MoveSession.js';
import { ResizeSession } from '@/runtime/interactions/input/sessions/ResizeSession.js';
import { getSnapRadius } from '@/runtime/input/snap/snapConfig.js';
import { getNearestSnapshot } from '@/runtime/input/spatial/nearestSnapshot.js';

let _unsubMove = null;
let _unsubResize = null;

export function registerGroupSessionRuntimeBridge() {
    if (_unsubMove || _unsubResize) return;

    _unsubMove = canvasBus.on('intent.group.move.start', ({ nodeIds, pointer, modifiers, originalEvent }) => {
        if (!Array.isArray(nodeIds) || nodeIds.length < 2) return;

        const runtime = useRuntimeStore.getState();
        const animated = useAnimatedRuntimeStore.getState();
        const nodesById =
            runtime?.nodes && Object.keys(runtime.nodes).length > 0
                ? runtime.nodes
                : animated?.nodes || {};

        const nodes = nodeIds.map((id) => nodesById[id]).filter(Boolean);
        const siblings = Object.values(nodesById).filter((n) => n && !nodeIds.includes(n.id));

        const zoomTier = 'normal';
        const snapRadius = getSnapRadius(zoomTier);
        const nearestSnapshot = getNearestSnapshot?.();
        const snapTargets = Array.isArray(nearestSnapshot?.nearest)
            ? nearestSnapshot.nearest.map((entry) => ({
                  id: entry.id,
                  ...entry.bounds,
              }))
            : [];

        const session = new MoveSession({
            nodeIds,
            nodes,
            siblings,
            canvas: null,
            startPointer: pointer,
            options: { snapRadius, snapTargets, modifiers },
        });

        canvasBus.emit('pointer.down', { session, event: originalEvent });
    });

    _unsubResize = canvasBus.on('intent.group.resize.start', ({ nodeIds, pointer, handle, modifiers, originalEvent }) => {
        if (!Array.isArray(nodeIds) || nodeIds.length < 2) return;

        const runtime = useRuntimeStore.getState();
        const nodesById = runtime.nodes || {};
        const nodes = nodeIds.map((id) => nodesById[id]).filter(Boolean);
        const siblings = Object.values(nodesById).filter((n) => n && !nodeIds.includes(n.id));

        const session = new ResizeSession({
            nodeIds,
            nodes,
            siblings,
            startPointer: pointer,
            handle,
            options: {
                lockAspectRatio: !!modifiers?.shiftKey,
            },
        });

        canvasBus.emit('pointer.down', { session, event: originalEvent });
    });
}
