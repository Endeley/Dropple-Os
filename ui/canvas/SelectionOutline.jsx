'use client';

import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore';
import { useWorkspaceState } from '@/runtime/state/useWorkspaceState.js';
import { projectRectToViewport } from '@/canvas/transform/projectRectToViewport.js';

export function SelectionOutline({ nodeId, color = 'rgba(59,130,246,0.6)' }) {
    const node = useAnimatedRuntimeStore((s) => s.nodes[nodeId]);
    if (!node) return null;
    const viewport = useWorkspaceState((state) => state.viewport);
    const rect = projectRectToViewport(
        {
            x: node.x ?? 0,
            y: node.y ?? 0,
            width: node.width ?? 0,
            height: node.height ?? 0,
        },
        viewport || { x: 0, y: 0, scale: 1 },
    );

    const style = {
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        pointerEvents: 'none',
        border: `1px solid ${color}`,
        boxShadow: `0 0 0 1px ${color}55`,
    };

    return <div style={style} />;
}
