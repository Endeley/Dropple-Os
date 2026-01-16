'use client';

export function ModeHint({ text }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 12,
        color: '#475569',
        background: '#f8fafc',
        border: '1px solid #e5e7eb',
        borderRadius: 999,
        padding: '4px 10px',
        pointerEvents: 'none',
        opacity: 0.9,
        zIndex: 10,
      }}
    >
      {text}
    </div>
  );
}
