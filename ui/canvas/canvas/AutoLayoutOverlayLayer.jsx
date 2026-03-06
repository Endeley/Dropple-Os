'use client';

export function AutoLayoutOverlayLayer({ children, interactive = false }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: interactive ? 'auto' : 'none',
        zIndex: 3,
      }}
    >
      {children}
    </div>
  );
}
