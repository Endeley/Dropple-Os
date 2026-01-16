'use client';

export function ViewerToolbar({
  zoom,
  zoomIn,
  zoomOut,
  resetZoom,
  toggleBg,
  toggleFullscreen,
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        display: 'flex',
        gap: 6,
        background: 'rgba(255,255,255,0.9)',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 6,
        zIndex: 10,
      }}
    >
      <button onClick={zoomOut} title="Zoom out">
        −
      </button>
      <button onClick={resetZoom} title="Reset zoom">
        {Math.round(zoom * 100)}%
      </button>
      <button onClick={zoomIn} title="Zoom in">
        +
      </button>
      <button onClick={toggleBg} title="Toggle background">
        BG
      </button>
      <button onClick={toggleFullscreen} title="Fullscreen">
        ⛶
      </button>
    </div>
  );
}
