'use client';

export default function TimelinePlayhead({ currentTime, durationMs }) {
  const safeDuration = durationMs > 0 ? durationMs : 1;
  const left = Math.min(100, Math.max(0, (currentTime / safeDuration) * 100));

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: `${left}%`,
        width: 2,
        background: '#ef4444',
        pointerEvents: 'none',
      }}
    />
  );
}
