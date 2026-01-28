'use client';

import { canvasBus } from '@/ui/canvasBus.js';
import { MoveSession } from '@/input/sessions/MoveSession.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { getSnapRadius } from '@/ui/canvas/snap/snapConfig.js';
import { getNearestSnapshot } from '@/ui/canvas/hooks/nearestSnapshot.js';

export function NodeView({ node, position, scale = 1, zoomTier = 'normal' }) {
    function onPointerDown(e) {
        if (e.button !== 0) return;
        e.preventDefault();

        const runtime = useRuntimeStore.getState();
        const nodesById = runtime?.nodes || {};
        const movingNodes = node?.id ? [nodesById[node.id]].filter(Boolean) : [];
        const siblings = Object.values(nodesById).filter((n) => n && n.id !== node.id);
        const snapRadius = getSnapRadius(zoomTier);
        const nearestSnapshot = getNearestSnapshot();
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
            nodeIds: [node.id],
            nodes: movingNodes,
            siblings,
            startPointer: { x: e.clientX, y: e.clientY },
            options: {
                snapRadius,
                snapTargets,
            },
        });

        canvasBus.emit('pointer.down', { session, event: e });
    }

    const showLabel = zoomTier !== 'far';
    const showFull = zoomTier === 'normal' || zoomTier === 'detail' || zoomTier === 'micro';
    const isFar = zoomTier === 'far';
    const isOverview = zoomTier === 'overview';

    const background = isFar
        ? 'rgba(147, 197, 253, 0.12)'
        : isOverview
          ? 'rgba(147, 197, 253, 0.2)'
          : '#e0e7ff';

    const border = isFar ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid #93c5fd';

    return (
        <div
            onPointerDown={onPointerDown}
            style={{
                position: 'absolute',
                left: position?.x ?? node.x,
                top: position?.y ?? node.y,
                width: (node.width ?? 0) * scale,
                height: (node.height ?? 0) * scale,
                background,
                color: '#111827',
                userSelect: 'none',
                cursor: 'grab',
                border,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: showFull ? 12 : 10,
                letterSpacing: showFull ? 0 : 0.3,
            }}
        >
            {showLabel ? node.id : null}
        </div>
    );
}
