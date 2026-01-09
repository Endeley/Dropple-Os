'use client';

import { useEffect, useRef, useState } from 'react';
import { useReplayState } from '@/runtime/replay/useReplayState';
import ReadOnlyNodeRenderer from './ReadOnlyNodeRenderer';
import { useSelection } from '@/components/workspace/SelectionContext';
import SnapGuidesOverlay from '@/components/canvas/SnapGuidesOverlay';
import { AutoLayoutOverlayLayer } from '@/components/canvas/AutoLayoutOverlayLayer';
import { shouldShowAutoLayoutOverlay } from '@/components/canvas/useAutoLayoutOverlayVisibility';
import { PaddingOverlay } from '@/components/canvas/overlays/PaddingOverlay';
import { GapOverlay } from '@/components/canvas/overlays/GapOverlay';
import { GridOverlay } from '@/components/canvas/overlays/GridOverlay';
import { ReorderIndicator } from '@/components/canvas/overlays/ReorderIndicator';
import { colors } from '@/ui/tokens';
import { AnnotationOverlay } from '@/education/AnnotationOverlay';
import { useEducationCursor } from '@/education/EducationCursorContext';
import { getEducationAtCursor } from '@/education/selectEducationState';

export default function CanvasStage({ adapter, events, cursor, emit }) {
  const containerRef = useRef(null);

  const state = useReplayState({ events, cursor });
  const { clear, selectedIds } = useSelection();

  const [viewport, setViewport] = useState({
    x: -500,
    y: -500,
    zoom: 1,
  });
  const [guides, setGuides] = useState([]);
  const [reorderPreview, setReorderPreview] = useState({
    active: false,
    parentId: null,
    toIndex: null,
  });
  const educationCursor = useEducationCursor();
  const educationRole = educationCursor?.role || 'teacher';
  const educationState = getEducationAtCursor(state, cursor);
  const isPreview =
    adapter?.id === 'preview' || adapter?.id === 'prototype' || adapter?.isPreview;
  const showAutoLayoutOverlay = shouldShowAutoLayoutOverlay({
    selectedIds,
    nodes: state.nodes,
    isPreview,
  });
  const overlayNode = showAutoLayoutOverlay
    ? state.nodes[Array.from(selectedIds)[0]]
    : null;
  const overlayChildren = overlayNode?.children?.length
    ? overlayNode.children.map((id) => state.nodes[id]).filter(Boolean)
    : [];
  const reorderParent = reorderPreview.parentId
    ? state.nodes[reorderPreview.parentId]
    : null;

  useEffect(() => {
    if (!reorderPreview.active && reorderPreview.parentId) {
      const timeout = setTimeout(() => {
        setReorderPreview({ active: false, parentId: null, toIndex: null });
      }, 120);
      return () => clearTimeout(timeout);
    }
  }, [reorderPreview.active, reorderPreview.parentId]);

  const panState = useRef({
    isPanning: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  function onMouseDown(e) {
    if (e.button === 1) {
      e.preventDefault();

      panState.current = {
        isPanning: true,
        startX: e.clientX,
        startY: e.clientY,
        originX: viewport.x,
        originY: viewport.y,
      };
    }
  }

  function onMouseMove(e) {
    if (!panState.current.isPanning) return;

    const dx = (e.clientX - panState.current.startX) / viewport.zoom;
    const dy = (e.clientY - panState.current.startY) / viewport.zoom;

    setViewport((v) => ({
      ...v,
      x: panState.current.originX - dx,
      y: panState.current.originY - dy,
    }));
  }

  function onMouseUp() {
    panState.current.isPanning = false;
  }

  function onWheel(e) {
    e.preventDefault();

    const zoomFactor = 0.001;
    const nextZoom = Math.min(
      4,
      Math.max(0.1, viewport.zoom - e.deltaY * zoomFactor)
    );

    const rect = containerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const worldX = viewport.x + cursorX / viewport.zoom;
    const worldY = viewport.y + cursorY / viewport.zoom;

    setViewport({
      zoom: nextZoom,
      x: worldX - cursorX / nextZoom,
      y: worldY - cursorY / nextZoom,
    });
  }

  return (
    <div
      ref={containerRef}
      className="canvas-viewport"
      style={{ background: colors.bg }}
      onMouseDown={(e) => {
        clear();
        onMouseDown(e);
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
    >
      <div
        className="canvas-world"
        style={{
          transform: `
            translate(${-viewport.x}px, ${-viewport.y}px)
            scale(${viewport.zoom})
          `,
        }}
      >
        <ReadOnlyNodeRenderer
          nodes={state.nodes}
          emit={emit}
          viewport={viewport}
          setGuides={setGuides}
          isPreview={isPreview}
          setReorderPreview={setReorderPreview}
          modeId={adapter?.id}
          educationRole={educationRole}
        />
        <AutoLayoutOverlayLayer>
          {overlayNode && (
            <>
              <PaddingOverlay node={overlayNode} />
              <GapOverlay node={overlayNode} childrenNodes={overlayChildren} />
              <GridOverlay node={overlayNode} />
            </>
          )}
          {adapter?.id === 'education' && educationState.annotations?.length ? (
            <AnnotationOverlay annotations={educationState.annotations} />
          ) : null}
          )}
          {reorderParent && reorderPreview.toIndex != null && (
            <ReorderIndicator
              parent={reorderParent}
              nodes={state.nodes}
              toIndex={reorderPreview.toIndex}
              active={reorderPreview.active}
            />
          )}
        </AutoLayoutOverlayLayer>
        <SnapGuidesOverlay guides={guides} />
      </div>
    </div>
  );
}
