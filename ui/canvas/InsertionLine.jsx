'use client';

import { useCharacterRenderNodes } from '@/runtime/characters/useCharacterRenderNodes.js';
import { useWorkspaceProjection } from '@/runtime/projection';
import { projectToViewport } from '@/canvas/transform/projectToViewport.js';

/**
 * Renders a visual insertion line for auto-layout reordering.
 * Pure UI, derived from current layout state.
 */
export default function InsertionLine({ containerId, index }) {
    const nodes = useCharacterRenderNodes();
    const viewport = useWorkspaceProjection((state) => state.viewport) || { x: 0, y: 0, scale: 1 };

    const container = nodes[containerId];
    if (!container) return null;

    const childrenIds = container.children || [];
    const children = childrenIds.map((id) => nodes[id]).filter(Boolean);

    const autoLayout = container.layout?.autoLayout;
    if (!autoLayout || autoLayout.type !== 'flex') return null;
    const isVertical = autoLayout.direction === 'column';

    let position;

    const padding = autoLayout.padding ?? 0;

    if (children.length === 0) {
        position = padding;
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

    const projectedContainerX = projectToViewport({ x: container.x ?? 0, y: 0 }, viewport).x;
    const projectedContainerY = projectToViewport({ x: 0, y: container.y ?? 0 }, viewport).y;
    const projectedPositionX = projectToViewport({ x: position, y: 0 }, viewport).x;
    const projectedPositionY = projectToViewport({ x: 0, y: position }, viewport).y;
    const width = (container.width ?? 0) * viewport.scale;
    const height = (container.height ?? 0) * viewport.scale;

    const style = isVertical
        ? {
              position: 'absolute',
              left: projectedContainerX,
              top: projectedPositionY,
              width,
              height: 2,
              background: 'rgba(59,130,246,0.9)',
              pointerEvents: 'none',
          }
        : {
              position: 'absolute',
              top: projectedContainerY,
              left: projectedPositionX,
              width: 2,
              height,
              background: 'rgba(59,130,246,0.9)',
              pointerEvents: 'none',
          };

    return <div style={style} />;
}
