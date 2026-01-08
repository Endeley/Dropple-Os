'use client';

import { useRef, useState } from 'react';
import { useReplayState } from '@/runtime/replay/useReplayState';
import ReadOnlyNodeRenderer from './ReadOnlyNodeRenderer';
import { useSelection } from '@/components/workspace/SelectionContext';
import SnapGuidesOverlay from '@/components/canvas/SnapGuidesOverlay';

export default function CanvasStage({ adapter, events, cursor, emit }) {
  const containerRef = useRef(null);

  const state = useReplayState({ events, cursor });
  const { clear } = useSelection();

  const [viewport, setViewport] = useState({
    x: -500,
    y: -500,
    zoom: 1,
  });
  const [guides, setGuides] = useState([]);

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
        />
        <SnapGuidesOverlay guides={guides} />
      </div>
    </div>
  );
}
