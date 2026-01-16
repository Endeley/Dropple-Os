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
import { ContextMenu } from '@/ui/context/ContextMenu';
import { useContextMenu } from '@/ui/context/useContextMenu';
import { CapabilityActions } from '@/ui/capabilities/capabilityActions';
import { exportJSON } from '@/export/exportJSON';
import { exportSVG } from '@/export/svg/exportSVG';
import { exportPNG } from '@/export/png/exportPNG';

export default function CanvasStage({
  adapter,
  events,
  cursor,
  emit,
  educationReadOnly = false,
  onImportJSONReplace,
  onImportJSONMerge,
  onImportSVGReplace,
  onImportSVGMerge,
  canImport = true,
}) {
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
  const isReview = adapter?.id === 'review';
  const isReadOnly =
    isReview || (adapter?.id === 'education' && (educationReadOnly || educationRole !== 'teacher'));
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
  const { menu, openMenu, closeMenu } = useContextMenu();

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

  function onContextMenu(e) {
    if (isReadOnly) return;
    e.preventDefault();

    const selected =
      selectedIds && selectedIds.size > 1
        ? Array.from(selectedIds).map((id) => state.nodes[id]).filter(Boolean)
        : [];
    const enabled = selected.length > 1;
    const hasNodes = Object.keys(state.nodes || {}).length > 0;
    const canShowImport = canImport;

    openMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        { key: 'align-left', label: 'Align Left', disabled: !enabled, onClick: () => CapabilityActions.alignLeft(selected, emit) },
        { key: 'align-center-x', label: 'Align Center', disabled: !enabled, onClick: () => CapabilityActions.alignCenterX(selected, emit) },
        { key: 'align-right', label: 'Align Right', disabled: !enabled, onClick: () => CapabilityActions.alignRight(selected, emit) },
        { type: 'separator' },
        { key: 'align-top', label: 'Align Top', disabled: !enabled, onClick: () => CapabilityActions.alignTop(selected, emit) },
        { key: 'align-center-y', label: 'Align Middle', disabled: !enabled, onClick: () => CapabilityActions.alignCenterY(selected, emit) },
        { key: 'align-bottom', label: 'Align Bottom', disabled: !enabled, onClick: () => CapabilityActions.alignBottom(selected, emit) },
        { type: 'separator' },
        { key: 'distribute-x', label: 'Distribute Horizontally', disabled: !enabled, onClick: () => CapabilityActions.distributeX(selected, emit) },
        { key: 'distribute-y', label: 'Distribute Vertically', disabled: !enabled, onClick: () => CapabilityActions.distributeY(selected, emit) },
        { type: 'separator' },
        { key: 'export-json', label: 'Export JSON', disabled: !hasNodes, onClick: () => exportJSON({ nodes: state.nodes, events, cursor }) },
        { key: 'export-svg', label: 'Export SVG', disabled: !hasNodes, onClick: () => exportSVG({ nodes: state.nodes }) },
        { key: 'export-png', label: 'Export PNG', disabled: !hasNodes, onClick: () => exportPNG({ nodes: state.nodes, scale: 2 }) },
        ...(canShowImport
          ? [
              { type: 'separator' },
              { key: 'import-json', label: 'Import JSON (Replace)', onClick: () => onImportJSONReplace?.() },
              { key: 'import-json-merge', label: 'Import JSON (Merge)', onClick: () => onImportJSONMerge?.() },
              { key: 'import-svg', label: 'Import SVG (Replace)', onClick: () => onImportSVGReplace?.() },
              { key: 'import-svg-merge', label: 'Import SVG (Merge)', onClick: () => onImportSVGMerge?.() },
            ]
          : []),
      ],
    });
  }

  return (
    <div
      ref={containerRef}
      className="canvas-viewport"
      style={{ background: colors.bg }}
      onMouseDown={(e) => {
        if (!isReview && e.button !== 2) {
          clear();
        }
        onMouseDown(e);
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
      onContextMenu={onContextMenu}
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
          educationReadOnly={educationReadOnly}
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
      {menu && (
        <ContextMenu x={menu.x} y={menu.y} items={menu.items} onClose={closeMenu} />
      )}
    </div>
  );
}
