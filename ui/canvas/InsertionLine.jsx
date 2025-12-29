'use client';

import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore';

/**
 * Renders a visual insertion line for auto-layout reordering.
 * Pure UI, derived from current layout state.
 */
export default function InsertionLine({ containerId, index }) {
    const nodes = useAnimatedRuntimeStore((s) => s.nodes);

    const container = nodes[containerId];
    if (!container) return null;

    const childrenIds = container.children || [];
    const children = childrenIds.map((id) => nodes[id]).filter(Boolean);

    const isVertical = container.layout?.mode === 'auto-y';
    if (!isVertical && container.layout?.mode !== 'auto-x') return null;

    let position;

    if (children.length === 0) {
        position = container.layout?.padding ?? 0;
    } else if (index <= 0) {
        const first = children[0];
        position = isVertical ? first.y : first.x;
    } else if (index >= children.length) {
        const last = children[children.length - 1];
        position = isVertical ? last.y + (last.height ?? 0) : last.x + (last.width ?? 0);
    } else {
        const target = children[index];
        position = isVertical ? target.y : target.x;
    }

    const style = isVertical
        ? {
              position: 'absolute',
              left: container.x ?? 0,
              right: 0,
              top: position,
              height: 2,
              background: 'rgba(59,130,246,0.9)',
              pointerEvents: 'none',
          }
        : {
              position: 'absolute',
              top: container.y ?? 0,
              bottom: 0,
              left: position,
              width: 2,
              background: 'rgba(59,130,246,0.9)',
              pointerEvents: 'none',
          };

    return <div style={style} />;
}
