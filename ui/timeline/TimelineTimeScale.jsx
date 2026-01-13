'use client';

export default function TimelineTimeScale({ durationMs }) {
  const safeDuration = durationMs > 0 ? durationMs : 1;
  const marks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    percent: t * 100,
    label: `${Math.round(safeDuration * t)} ms`,
  }));

  return (
    <div style={{ position: 'relative', height: 20, marginBottom: 8 }}>
      {marks.map((mark) => (
        <div
          key={mark.percent}
          style={{
            position: 'absolute',
            left: `${mark.percent}%`,
            transform: 'translateX(-50%)',
            fontSize: 10,
            color: '#64748b',
          }}
        >
          {mark.label}
        </div>
      ))}
    </div>
  );
}
