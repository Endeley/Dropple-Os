'use client';

export default function CurveHandle({ x, y, active = false, onPointerDown }) {
  const size = active ? 10 : 8;

  return (
    <circle
      cx={x}
      cy={y}
      r={size / 2}
      fill={active ? '#2563eb' : '#0f172a'}
      stroke="#ffffff"
      strokeWidth="1.5"
      onPointerDown={onPointerDown}
      style={{ cursor: 'grab' }}
    />
  );
}
