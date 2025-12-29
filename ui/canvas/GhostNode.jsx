'use client';

import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore';

/**
 * Visual-only ghost for a node.
 * Uses real node position + delta.
 */
export function GhostNode({ nodeId, delta }) {
  const node = useAnimatedRuntimeStore((s) => s.nodes[nodeId]);
  if (!node) return null;

    const style = {
        position: 'absolute',
        left: (node.x ?? 0) + delta.x,
        top: (node.y ?? 0) + delta.y,
        width: node.width,
        height: node.height,
        pointerEvents: 'none',
        border: '1px dashed rgba(59,130,246,0.7)',
        background: 'rgba(59,130,246,0.12)',
    };

    return <div style={style} />;
}
