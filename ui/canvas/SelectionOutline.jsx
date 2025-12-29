'use client';

import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore';

export function SelectionOutline({ nodeId, color = 'rgba(59,130,246,0.6)' }) {
    const node = useAnimatedRuntimeStore((s) => s.nodes[nodeId]);
    if (!node) return null;

    const style = {
        position: 'absolute',
        left: node.x ?? 0,
        top: node.y ?? 0,
        width: node.width ?? 0,
        height: node.height ?? 0,
        pointerEvents: 'none',
        border: `1px solid ${color}`,
        boxShadow: `0 0 0 1px ${color}55`,
    };

    return <div style={style} />;
}
