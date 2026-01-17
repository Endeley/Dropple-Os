'use client';

export default function PresenceDots({ presence }) {
  if (!presence || presence.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 8,
        right: 8,
        display: 'flex',
        gap: 6,
        pointerEvents: 'none',
        zIndex: 20,
      }}
    >
      {presence.map((entry) => (
        <div
          key={entry.userId}
          title={entry.name || entry.userId}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#64748b',
          }}
        />
      ))}
    </div>
  );
}
