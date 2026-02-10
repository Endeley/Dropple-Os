import { canvasBus } from '@/ui/canvasBus.js';
import { MoveSession } from '@/input/sessions/MoveSession.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { getSnapRadius } from '@/ui/canvas/snap/snapConfig.js';
import { getNearestSnapshot } from '@/ui/canvas/hooks/nearestSnapshot.js';
import { useSelectionStore } from '@/selection/useSelectionStore.js';

let _unsub = null;

/**
 * Registers the drag resolver once.
 * - listens for intent emitted by NodeView
 * - creates MoveSession (engine-side concept)
 * - routes into sessionBinding via canvasBus pointer.down
 */
export function registerNodeDragResolver() {
    if (_unsub) return _unsub;

    const handler = (intent) => {
        const nodeId = intent?.nodeId;
        const event = intent?.event;
        const pointer = intent?.pointer;

        if (!nodeId || !event || !pointer) return;

        const selectionState = useSelectionStore.getState();
        const existing = Array.isArray(selectionState.selectedIds)
            ? selectionState.selectedIds
            : [];
        const multi = event.shiftKey || event.metaKey || event.ctrlKey;
        if (multi) {
            const next = new Set(existing);
            if (next.has(nodeId)) {
                next.delete(nodeId);
            } else {
                next.add(nodeId);
            }
            selectionState.setSelectedIds(Array.from(next));
        } else {
            selectionState.setSelectedIds([nodeId]);
        }

        const runtime = useRuntimeStore.getState();
        const animated = useAnimatedRuntimeStore.getState();
        const nodesById = (runtime?.nodes && Object.keys(runtime.nodes).length > 0)
            ? runtime.nodes
            : animated?.nodes || {};
        const node = nodesById[nodeId];

        if (!node) return;

        // Optional rule: only frames draggable
        if (node.type && node.type !== 'frame') return;

        const siblings = Object.values(nodesById).filter((n) => n && n.id !== nodeId);

        const zoomTier = intent?.zoomTier ?? 'normal';
        const snapRadius = getSnapRadius(zoomTier);

        const nearestSnapshot = getNearestSnapshot?.();
        const snapTargets = Array.isArray(nearestSnapshot?.nearest)
            ? nearestSnapshot.nearest.map((entry) => ({
                  id: entry.id,
                  x: entry.bounds.x,
                  y: entry.bounds.y,
                  width: entry.bounds.width,
                  height: entry.bounds.height,
              }))
            : [];

        const session = new MoveSession({
            nodeIds: [nodeId],
            nodes: [node],
            siblings,
            startPointer: { x: pointer.x, y: pointer.y },
            options: {
                snapRadius,
                snapTargets,
            },
        });

        canvasBus.emit('pointer.down', { session, event });
    };

    _unsub = canvasBus.on('intent.node.pointerDown', handler);
    return _unsub;
}
