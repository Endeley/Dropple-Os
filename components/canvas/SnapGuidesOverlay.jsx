'use client';

export default function SnapGuidesOverlay({ guides }) {
  if (!guides?.length) return null;

  return (
    <>
      {guides.map((g, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: g.axis === 'v' ? g.position : 0,
            top: g.axis === 'h' ? g.position : 0,
            width: g.axis === 'v' ? 1 : '100%',
            height: g.axis === 'h' ? 1 : '100%',
            background: 'rgba(37, 99, 235, 0.8)',
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  );
}
