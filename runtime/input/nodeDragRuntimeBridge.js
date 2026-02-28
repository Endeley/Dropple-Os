import { getSnapRadius } from './snap/snapConfig.js';

export function createNodeDragSessionIntent({
    intent,
    selectedIds = [],
    nodesById = {},
    nearestSnapshot = null,
    zoomTier = 'normal',
}) {
    const nodeId = intent?.nodeId;
    const event = intent?.event;
    const pointer = intent?.pointer;

    if (!nodeId || !event || !pointer) return null;

    const existing = Array.isArray(selectedIds) ? selectedIds : [];
    const multi = event.shiftKey || event.metaKey || event.ctrlKey;
    let nextSelectedIds = existing;

    if (multi) {
        const next = new Set(existing);
        if (next.has(nodeId)) {
            next.delete(nodeId);
        } else {
            next.add(nodeId);
        }
        nextSelectedIds = Array.from(next);
    } else {
        nextSelectedIds = [nodeId];
    }

    const node = nodesById[nodeId];
    if (!node) return null;

    // Optional rule: only frames draggable
    if (node.type && node.type !== 'frame') return null;

    const snapRadius = getSnapRadius(zoomTier);
    const snapTargets = Array.isArray(nearestSnapshot?.nearest)
        ? nearestSnapshot.nearest.map((entry) => ({
              id: entry.id,
              x: entry.bounds.x,
              y: entry.bounds.y,
              width: entry.bounds.width,
              height: entry.bounds.height,
          }))
        : [];

    return {
        nextSelectedIds,
        sessionIntent: {
            sessionType: 'move',
            payload: {
                nodeIds: [nodeId],
                startPointer: { x: pointer.x, y: pointer.y },
                options: {
                    snapRadius,
                    snapTargets,
                },
            },
            originalEvent: event,
        },
    };
}
