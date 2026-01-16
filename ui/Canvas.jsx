'use client';

import { useEffect, useRef, useState } from 'react';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { canvasBus } from '@/ui/canvasBus.js';
import { NodeView } from './NodeView.jsx';
import { useSelection } from '@/components/workspace/SelectionContext';
import { computeSelectionBounds } from '@/ui/selection/selectionBounds.js';
import { SelectionBox } from '@/ui/selection/SelectionBox.jsx';
import { MoveSession } from '@/input/sessions/MoveSession.js';
import { ResizeSession } from '@/input/sessions/ResizeSession.js';
import { dispatcher } from '@/ui/interaction/dispatcher.js';
import { EventTypes } from '@/core/events/eventTypes.js';

export default function Canvas() {
  const nodes = useRuntimeStore((s) => s.nodes);
  const nodeList = Object.values(nodes);

  const { selectedIds, selectSingle, setSelection, clear } = useSelection();
  const selectedNodes = selectedIds
    ? nodeList.filter((node) => selectedIds.has(node.id))
    : [];
  const unselectedNodes = selectedIds
    ? nodeList.filter((node) => !selectedIds.has(node.id))
    : nodeList;
  const selectionBounds =
    selectedNodes.length > 1 ? computeSelectionBounds(selectedNodes) : null;

  const containerRef = useRef(null);

  const [dragStart, setDragStart] = useState(null);
  const [dragCurrent, setDragCurrent] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const isIdle =
    (!selectedIds || selectedIds.size === 0) && nodeList.length === 0;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prev = window.__droppleDebug;
    const api = {
      ...prev,
      createNode: ({ id, x = 40, y = 40, width = 160, height = 100 } = {}) => {
        const nodeId =
          id ||
          (typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `node-${Math.random().toString(36).slice(2, 10)}`);

        dispatcher.dispatch({
          type: EventTypes.NODE_CREATE,
          payload: {
            node: {
              id: nodeId,
              x,
              y,
              width,
              height,
            },
          },
        });

        return { id: nodeId };
      },
      select: (ids = []) => setSelection?.(ids),
      selectSingle: (id) => selectSingle?.(id),
      clearSelection: () => clear?.(),
      getState: () => dispatcher.getState?.(),
    };

    window.__droppleDebug = api;

    return () => {
      if (window.__droppleDebug === api) {
        if (prev) {
          window.__droppleDebug = prev;
        } else {
          delete window.__droppleDebug;
        }
      }
    };
  }, [clear, selectSingle, setSelection]);

  function getLocalPoint(e) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  const onPointerDown = (e) => {
    canvasBus.emit('pointer.down', e);

    if (!isIdle) return;

    const point = getLocalPoint(e);
    if (!point) return;

    setDragStart(point);
    setDragCurrent(point);
    setIsDragging(true);
  };

  const onPointerMove = (e) => {
    canvasBus.emit('pointer.move', e);

    if (!isDragging) return;

    const point = getLocalPoint(e);
    if (!point) return;

    setDragCurrent(point);
  };

  const onPointerUp = (e) => {
    canvasBus.emit('pointer.up', e);

    if (!isDragging || !dragStart || !dragCurrent) {
      resetDrag();
      return;
    }

    const x = Math.min(dragStart.x, dragCurrent.x);
    const y = Math.min(dragStart.y, dragCurrent.y);
    const width = Math.abs(dragCurrent.x - dragStart.x);
    const height = Math.abs(dragCurrent.y - dragStart.y);

    if (width > 6 && height > 6) {
      canvasBus.emit('intent.create', {
        bounds: { x, y, width, height },
        source: 'canvas.drag',
      });
    }

    resetDrag();
  };

  const onPointerCancel = (e) => {
    canvasBus.emit('pointer.cancel', e);
    resetDrag();
  };

  function resetDrag() {
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  }

  function getCanvasSize() {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { width: rect.width, height: rect.height };
  }

  function startGroupMove(e) {
    if (selectedNodes.length < 2) return;

    const session = new MoveSession({
      nodeIds: selectedNodes.map((node) => node.id),
      nodes: selectedNodes,
      siblings: unselectedNodes,
      canvas: getCanvasSize(),
      startPointer: { x: e.clientX, y: e.clientY },
    });

    canvasBus.emit('pointer.down', { session, event: e });
  }

  function startGroupResize(e) {
    if (!selectionBounds || selectedNodes.length < 2) return;

    const session = new ResizeSession({
      nodeIds: selectedNodes.map((node) => node.id),
      nodes: selectedNodes,
      siblings: unselectedNodes,
      canvas: getCanvasSize(),
      startPointer: { x: e.clientX, y: e.clientY },
      handle: 'se',
      options: { lockAspectRatio: e.shiftKey },
    });

    canvasBus.emit('pointer.down', { session, event: e });
  }

  const ghostRect =
    isDragging && dragStart && dragCurrent
      ? {
          x: Math.min(dragStart.x, dragCurrent.x),
          y: Math.min(dragStart.y, dragCurrent.y),
          width: Math.abs(dragCurrent.x - dragStart.x),
          height: Math.abs(dragCurrent.y - dragStart.y),
        }
      : null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#fafafa',
        overflow: 'hidden',
        cursor: isIdle ? 'crosshair' : 'default',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {ghostRect && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: ghostRect.x,
            top: ghostRect.y,
            width: ghostRect.width,
            height: ghostRect.height,
            border: '1px dashed #94a3b8',
            background: 'rgba(148, 163, 184, 0.08)',
            pointerEvents: 'none',
            transition: 'all 80ms ease',
          }}
        />
      )}

      {selectionBounds && (
        <SelectionBox
          bounds={selectionBounds}
          onMoveStart={startGroupMove}
          onResizeStart={startGroupResize}
        />
      )}

      {nodeList.map((node) => (
        <NodeView key={node.id} node={node} />
      ))}
    </div>
  );
}
