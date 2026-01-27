'use client';

import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore';
import { useWorkspaceState } from '@/runtime/state/useWorkspaceState.js';
import { projectRectToViewport } from '@/canvas/transform/projectRectToViewport.js';

/**
 * Visual-only ghost for a node.
 * Uses real node position + delta.
 */
export function GhostNode({ nodeId, delta }) {
  const node = useAnimatedRuntimeStore((s) => s.nodes[nodeId]);
  if (!node) return null;
  const viewport = useWorkspaceState((state) => state.viewport);
  const rect = projectRectToViewport(
    {
      x: (node.x ?? 0) + (delta?.x ?? 0),
      y: (node.y ?? 0) + (delta?.y ?? 0),
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
    border: '1px dashed rgba(59,130,246,0.7)',
    background: 'rgba(59,130,246,0.12)',
  };

  return <div style={style} />;
}
