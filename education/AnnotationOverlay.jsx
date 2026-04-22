export function AnnotationOverlay({ annotations }) {
  return (
    <>
      {annotations.map((a, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: a.x,
            top: a.y,
            background: 'var(--surface-panel)',
            border: '1px solid var(--border-strong)',
            padding: 'var(--space-sm)',
            fontSize: 12,
            maxWidth: 240,
            borderRadius: 'var(--radius-sm)',
            pointerEvents: 'none',
          }}
        >
          {a.text}
        </div>
      ))}
    </>
  );
}
