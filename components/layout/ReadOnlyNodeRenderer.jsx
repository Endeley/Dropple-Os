'use client';

import { useRef, useState } from 'react';
import { useSelection } from '@/components/workspace/SelectionContext';
import { computeSnapGuides } from '@/components/canvas/computeSnapGuides';
import { resolveResizeSnap, resolveSnap } from '@/components/canvas/resolveSnap';

export default function ReadOnlyNodeRenderer({
  nodes,
  emit,
  viewport,
  setGuides,
}) {
  const { selectedIds, select } = useSelection();

  const dragRef = useRef({
    draggingId: null,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const resizeRef = useRef({
    resizingId: null,
    startX: 0,
    startY: 0,
    originW: 0,
    originH: 0,
  });

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeDelta, setResizeDelta] = useState({ w: 0, h: 0 });

  if (!nodes) return null;

  function onNodeMouseDown(e, node) {
    e.stopPropagation();

    select(node.id);

    dragRef.current = {
      draggingId: node.id,
      startX: e.clientX,
      startY: e.clientY,
      originX: node.layout?.x ?? 0,
      originY: node.layout?.y ?? 0,
    };

    setDragOffset({ x: 0, y: 0 });
  }

  function onMouseMove(e) {
    if (dragRef.current.draggingId) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      setDragOffset({ x: dx, y: dy });

      const node = nodes[dragRef.current.draggingId];
      if (node) {
        const baseWidth = node.layout?.width || 100;
        const baseHeight = node.layout?.height || 100;
        const moving = {
          id: node.id,
          x: (node.layout?.x || 0) + dx,
          y: (node.layout?.y || 0) + dy,
          width: baseWidth,
          height: baseHeight,
        };

        const nextGuides = computeSnapGuides({
          movingNode: moving,
          nodes,
          viewport,
        });

        setGuides(nextGuides);
      }
    }

    if (resizeRef.current.resizingId) {
      const dw = e.clientX - resizeRef.current.startX;
      const dh = e.clientY - resizeRef.current.startY;

      setResizeDelta({ w: dw, h: dh });
    }
  }

  function onMouseUp() {
    const { draggingId, originX, originY } = dragRef.current;
    const { resizingId, originW, originH } = resizeRef.current;

    if (draggingId) {
      const dx = dragOffset.x;
      const dy = dragOffset.y;
      const node = nodes[draggingId];

      if (node) {
        const moving = {
          id: draggingId,
          x: originX + dx,
          y: originY + dy,
          width: node.layout?.width || 100,
          height: node.layout?.height || 100,
        };

        const snapped = resolveSnap({
          movingNode: moving,
          nodes,
          viewport,
        });

        emit({
          type: 'node.layout.move',
          payload: {
            nodeId: draggingId,
            x: snapped.x,
            y: snapped.y,
          },
        });
      }
    }

    if (resizingId) {
      const dw = resizeDelta.w;
      const dh = resizeDelta.h;
      const node = nodes[resizingId];

      if (node) {
        const resizing = {
          id: resizingId,
          x: node.layout?.x || 0,
          y: node.layout?.y || 0,
          width: originW + dw,
          height: originH + dh,
        };

        const snapped = resolveResizeSnap({
          resizingNode: resizing,
          nodes,
          viewport,
        });

        emit({
          type: 'node.layout.resize',
          payload: {
            nodeId: resizingId,
            width: snapped.width,
            height: snapped.height,
          },
        });
      }
    }

    dragRef.current.draggingId = null;
    setDragOffset({ x: 0, y: 0 });
    resizeRef.current.resizingId = null;
    setResizeDelta({ w: 0, h: 0 });
    setGuides([]);
  }

  return (
    <div onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      {Object.values(nodes).map((node) => {
        const layout = node.layout || {};
        const isSelected = selectedIds.has(node.id);
        const isDragging = dragRef.current.draggingId === node.id;
        const isResizing = resizeRef.current.resizingId === node.id;
        const baseWidth = layout.width || 100;
        const baseHeight = layout.height || 100;
        const previewWidth = isResizing
          ? Math.max(20, baseWidth + resizeDelta.w)
          : baseWidth;
        const previewHeight = isResizing
          ? Math.max(20, baseHeight + resizeDelta.h)
          : baseHeight;

        return (
          <div
            key={node.id}
            data-node-id={node.id}
            onMouseDown={(e) => onNodeMouseDown(e, node)}
            style={{
              position: 'absolute',
              left: layout.x || 0,
              top: layout.y || 0,
              width: previewWidth,
              height: previewHeight,
              border: isSelected ? '2px solid #2563eb' : '1px solid #94a3b8',
              background: 'rgba(37, 99, 235, 0.05)',
              boxSizing: 'border-box',
              cursor: isSelected ? 'move' : 'default',
              transform: isDragging
                ? `translate(${dragOffset.x}px, ${dragOffset.y}px)`
                : undefined,
              transition: isDragging ? 'none' : 'transform 120ms ease-out',
            }}
          >
            {node.type} · {node.id}
            {isSelected && (
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();

                  resizeRef.current = {
                    resizingId: node.id,
                    startX: e.clientX,
                    startY: e.clientY,
                    originW: baseWidth,
                    originH: baseHeight,
                  };

                  setResizeDelta({ w: 0, h: 0 });
                }}
                style={{
                  position: 'absolute',
                  right: -6,
                  bottom: -6,
                  width: 12,
                  height: 12,
                  background: '#2563eb',
                  cursor: 'nwse-resize',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
