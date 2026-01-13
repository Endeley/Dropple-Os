'use client';

import { useRef, useState } from 'react';
import { useSelection } from '@/components/workspace/SelectionContext';
import { computeSnapGuides } from '@/components/canvas/computeSnapGuides';
import { resolveResizeSnap, resolveSnap } from '@/components/canvas/resolveSnap';
import { useGrid } from '@/components/workspace/GridContext';
import {
  resolveGridSnapPosition,
  resolveGridSnapSize,
} from '@/components/canvas/resolveGridSnap';
import { useInteractionModifiers } from '@/components/interaction/useInteractionModifiers';
import { modifiersAllowed } from '@/components/interaction/isModifierAllowed';
import { serializeSelection } from '@/components/workspace/serializeSelection';
import { pasteFromClipboard } from '@/components/workspace/pasteFromClipboard';
import {
  computeFlexReorderIndex,
  computeGridReorderIndex,
} from '@/components/layout/computeReorderIndex';
import { colors, motion } from '@/ui/tokens';

export default function ReadOnlyNodeRenderer({
  nodes,
  emit,
  viewport,
  setGuides,
  isPreview = false,
  setReorderPreview,
  modeId,
  educationRole = 'teacher',
  educationReadOnly = false,
}) {
  const { selectedIds, selectSingle, toggle, setSelection } = useSelection();
  const { grid } = useGrid();
  const mods = useInteractionModifiers();
  const isEducationReadOnly =
    modeId === 'education' && (educationReadOnly || educationRole !== 'teacher');
  const isReadOnly = modeId === 'review' || isEducationReadOnly;

  const dragRef = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    primaryId: null,
    origins: new Map(),
    lockedDx: 0,
    lockedDy: 0,
    duplicating: false,
    snapshot: null,
    modifiersAllowed: false,
  });
  const reorderRef = useRef({
    active: false,
    fromIndex: null,
    toIndex: null,
    parentId: null,
    nodeId: null,
    startX: 0,
    startY: 0,
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
  const [hoveredId, setHoveredId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigins, setDragOrigins] = useState(() => new Map());
  const [resizingId, setResizingId] = useState(null);

  if (!nodes) return null;

  function onNodeMouseDown(e, node) {
    if (isReadOnly) {
      return;
    }
    e.stopPropagation();

    if (e.shiftKey) {
      toggle(node.id);
    } else {
      selectSingle(node.id);
    }

    const parent = node.parentId ? nodes[node.parentId] : null;
    const isAutoChild = !!parent?.layout?.autoLayout;
    const selection = new Set(e.shiftKey ? selectedIds : [node.id]);
    const isReorderIntent =
      mods.alt && isAutoChild && selection.size === 1 && !isPreview;

    if (isReorderIntent) {
      const fromIndex = parent.children.indexOf(node.id);
      reorderRef.current = {
        active: true,
        parentId: node.parentId,
        fromIndex,
        toIndex: null,
        nodeId: node.id,
        startX: e.clientX,
        startY: e.clientY,
      };
      dragRef.current.dragging = false;
      setReorderPreview?.({
        active: true,
        parentId: node.parentId,
        toIndex: null,
      });
      return;
    }

    if (isAutoChild) return;

    const allowModifiers = !isPreview && modifiersAllowed(node, nodes);
    const duplicating = allowModifiers && mods.alt;
    const snapshot = duplicating
      ? serializeSelection({ state: { nodes }, selectedIds: selection })
      : null;

    const origins = new Map(
      Array.from(selection).map((id) => {
        const n = nodes[id];
        return [id, { x: n.layout.x, y: n.layout.y }];
      })
    );

    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      primaryId: node.id,
      origins,
      lockedDx: 0,
      lockedDy: 0,
      duplicating,
      snapshot,
      modifiersAllowed: allowModifiers,
    };

    setIsDragging(true);
    setDragOrigins(origins);
    setDragOffset({ x: 0, y: 0 });
  }

  function onMouseMove(e) {
    if (isReadOnly) {
      return;
    }
    if (reorderRef.current.active) {
      if (!mods.alt) {
        const { parentId, toIndex } = reorderRef.current;
        reorderRef.current.active = false;
        reorderRef.current.fromIndex = null;
        reorderRef.current.toIndex = null;
        reorderRef.current.parentId = null;
        reorderRef.current.nodeId = null;
        setReorderPreview?.({ active: false, parentId, toIndex });
        return;
      }

      const parent = nodes[reorderRef.current.parentId];
      const node = nodes[reorderRef.current.nodeId];
      if (!parent?.layout?.autoLayout || !node) {
        const { parentId, toIndex } = reorderRef.current;
        reorderRef.current.active = false;
        reorderRef.current.fromIndex = null;
        reorderRef.current.toIndex = null;
        reorderRef.current.parentId = null;
        reorderRef.current.nodeId = null;
        setReorderPreview?.({ active: false, parentId, toIndex });
        return;
      }

      const children = parent.children.map((id) => nodes[id]).filter(Boolean);
      if (!children.length) return;

      const dx = e.clientX - reorderRef.current.startX;
      const dy = e.clientY - reorderRef.current.startY;
      const cursor = {
        x: node.layout.x + dx + node.layout.width / 2 - parent.layout.x,
        y: node.layout.y + dy + node.layout.height / 2 - parent.layout.y,
      };

      const nextIndex =
        parent.layout.autoLayout.type === 'grid'
          ? computeGridReorderIndex({ parent, children, cursor })
          : computeFlexReorderIndex({ parent, children, cursor });
      const clampedIndex = Math.max(
        0,
        Math.min(children.length - 1, nextIndex)
      );

      reorderRef.current.toIndex = clampedIndex;
      setReorderPreview?.({
        active: true,
        parentId: reorderRef.current.parentId,
        toIndex: clampedIndex,
      });
      return;
    }

    if (dragRef.current.dragging) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      let lockedDx = dx;
      let lockedDy = dy;

      if (dragRef.current.modifiersAllowed && mods.shift) {
        if (Math.abs(dx) > Math.abs(dy)) {
          lockedDy = 0;
        } else {
          lockedDx = 0;
        }
      }

      dragRef.current.lockedDx = lockedDx;
      dragRef.current.lockedDy = lockedDy;

      setDragOffset({ x: lockedDx, y: lockedDy });

      const primaryNode = nodes[dragRef.current.primaryId];
      const primaryOrigin = dragRef.current.origins.get(
        dragRef.current.primaryId
      );
      if (primaryNode && primaryOrigin) {
        const baseWidth = primaryNode.layout?.width || 100;
        const baseHeight = primaryNode.layout?.height || 100;
        const moving = {
          id: primaryNode.id,
          x: primaryOrigin.x + lockedDx,
          y: primaryOrigin.y + lockedDy,
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
    if (isReadOnly) {
      return;
    }
    if (reorderRef.current.active) {
      const { parentId, fromIndex, toIndex } = reorderRef.current;
      const parent = nodes[parentId];
      const shouldCommit =
        mods.alt &&
        parent?.layout?.autoLayout &&
        toIndex != null &&
        fromIndex !== toIndex;

      if (shouldCommit) {
        emit({
          type: 'node.children.reorder',
          payload: {
            parentId,
            fromIndex,
            toIndex,
          },
        });
      }

      reorderRef.current.active = false;
      reorderRef.current.fromIndex = null;
      reorderRef.current.toIndex = null;
      reorderRef.current.parentId = null;
      reorderRef.current.nodeId = null;
      setReorderPreview?.({ active: false, parentId, toIndex });
      return;
    }

    const { dragging, primaryId, origins } = dragRef.current;
    const { resizingId, originW, originH } = resizeRef.current;

    if (dragging) {
      const primaryOrigin = origins.get(primaryId);
      const primaryNode = nodes[primaryId];

      if (primaryNode && primaryOrigin) {
        const baseDx = dragRef.current.lockedDx ?? dragOffset.x;
        const baseDy = dragRef.current.lockedDy ?? dragOffset.y;
        let commitX = primaryOrigin.x + baseDx;
        let commitY = primaryOrigin.y + baseDy;

        if (grid.enabled) {
          const snapped = resolveGridSnapPosition({
            x: commitX,
            y: commitY,
            size: grid.size,
          });
          commitX = snapped.x;
          commitY = snapped.y;
        }

        const movingPrimary = {
          id: primaryId,
          x: commitX,
          y: commitY,
          width: primaryNode.layout?.width || 100,
          height: primaryNode.layout?.height || 100,
        };

        const snapped = resolveSnap({
          movingNode: movingPrimary,
          nodes,
          viewport,
        });

        const dx = snapped.x - movingPrimary.x;
        const dy = snapped.y - movingPrimary.y;

        const shouldDuplicate =
          dragRef.current.duplicating &&
          dragRef.current.modifiersAllowed &&
          mods.alt;

        if (shouldDuplicate && dragRef.current.snapshot) {
          const newIds = pasteFromClipboard({
            clipboard: dragRef.current.snapshot,
            emit,
            offset: 0,
          });

          dragRef.current.snapshot.nodes.forEach((node, index) => {
            const newId = newIds[index];
            if (!newId) return;

            emit({
              type: 'node.layout.move',
              payload: {
                nodeId: newId,
                x: node.layout.x + baseDx + dx,
                y: node.layout.y + baseDy + dy,
              },
            });
          });

          setSelection(new Set(newIds));
          dragRef.current.dragging = false;
          dragRef.current.duplicating = false;
          dragRef.current.snapshot = null;
          setIsDragging(false);
          setDragOrigins(new Map());
          setDragOffset({ x: 0, y: 0 });
          resizeRef.current.resizingId = null;
          setResizingId(null);
          setResizeDelta({ w: 0, h: 0 });
          setGuides([]);
          return;
        }

        origins.forEach((origin, nodeId) => {
          emit({
            type: 'node.layout.move',
            payload: {
              nodeId,
              x: origin.x + baseDx + dx,
              y: origin.y + baseDy + dy,
            },
          });
        });
      }
    }

    if (resizingId) {
      const dw = resizeDelta.w;
      const dh = resizeDelta.h;
      const node = nodes[resizingId];

      if (node) {
        const allowResizeModifiers =
          !isPreview &&
          selectedIds.size === 1 &&
          modifiersAllowed(node, nodes);
        let finalWidth = originW + dw;
        let finalHeight = originH + dh;

        if (grid.enabled) {
          const snapped = resolveGridSnapSize({
            width: finalWidth,
            height: finalHeight,
            size: grid.size,
          });
          finalWidth = snapped.width;
          finalHeight = snapped.height;
        }

        const resizing = {
          id: resizingId,
          x: node.layout?.x || 0,
          y: node.layout?.y || 0,
          width: finalWidth,
          height: finalHeight,
        };

        const snapped = resolveResizeSnap({
          resizingNode: resizing,
          nodes,
          viewport,
        });

        finalWidth = snapped.width;
        finalHeight = snapped.height;

        const lockRatio = allowResizeModifiers && mods.shift;
        const ratio =
          node.layout?.constraints?.aspectRatio ??
          (lockRatio ? originW / originH : null);

        if (ratio && lockRatio) {
          finalHeight = finalWidth / ratio;
        }

        emit({
          type: 'node.layout.resize',
          payload: {
            nodeId: resizingId,
            width: Math.round(finalWidth),
            height: Math.round(finalHeight),
          },
        });
      }
    }

    dragRef.current.dragging = false;
    dragRef.current.duplicating = false;
    dragRef.current.snapshot = null;
    setIsDragging(false);
    setDragOrigins(new Map());
    setDragOffset({ x: 0, y: 0 });
    resizeRef.current.resizingId = null;
    setResizingId(null);
    setResizeDelta({ w: 0, h: 0 });
    setGuides([]);
  }

  return (
    <div onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      {Object.values(nodes).map((node) => {
        const layout = node.layout || {};
        const isSelected = selectedIds.has(node.id);
        const isResizing = resizingId === node.id;
        const origin = dragOrigins.get(node.id);
        const parent = node.parentId ? nodes[node.parentId] : null;
        const isAutoChild = !!parent?.layout?.autoLayout;
        const baseWidth = layout.width || 100;
        const baseHeight = layout.height || 100;
        let previewWidth = isResizing
          ? Math.max(20, baseWidth + resizeDelta.w)
          : baseWidth;
        let previewHeight = isResizing
          ? Math.max(20, baseHeight + resizeDelta.h)
          : baseHeight;
        const allowResizeModifiers =
          !isPreview &&
          selectedIds.size === 1 &&
          modifiersAllowed(node, nodes);
        if (isResizing && allowResizeModifiers && mods.shift) {
          const ratio = baseWidth / baseHeight;
          previewHeight = Math.max(20, previewWidth / ratio);
        }
        const previewX = origin ? origin.x + dragOffset.x : layout.x || 0;
        const previewY = origin ? origin.y + dragOffset.y : layout.y || 0;

        return (
          <div
            key={node.id}
            data-node-id={node.id}
            onMouseDown={(e) => onNodeMouseDown(e, node)}
            onMouseEnter={() => setHoveredId(node.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              position: 'absolute',
              left: layout.x || 0,
              top: layout.y || 0,
              width: previewWidth,
              height: previewHeight,
              border: isSelected
                ? `1px solid ${colors.primary}`
                : `1px solid ${colors.borderStrong}`,
              boxShadow: isSelected
                ? `0 0 0 1px ${colors.primarySoft}`
                : undefined,
              background:
                hoveredId === node.id || isSelected
                  ? colors.primarySoft
                  : 'transparent',
              boxSizing: 'border-box',
              cursor: isSelected ? (isAutoChild ? 'default' : 'move') : 'default',
              transform: isDragging
                ? `translate(${previewX - (layout.x || 0)}px, ${
                    previewY - (layout.y || 0)
                  }px)`
                : undefined,
              transition: isDragging
                ? 'none'
                : `left ${motion.base}, top ${motion.base}`,
            }}
          >
            {node.type} · {node.id}
            {!isReadOnly && isSelected && (
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

                  setResizingId(node.id);
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
