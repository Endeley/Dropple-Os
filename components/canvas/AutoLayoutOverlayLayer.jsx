'use client';

export function AutoLayoutOverlayLayer({ children }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 3,
      }}
    >
      {children}
    </div>
  );
}
