'use client';

export default function CursorsLayer({ presence, selfUserId, viewport }) {
  if (!presence || presence.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 15,
      }}
    >
      {presence.map((entry) => {
        if (entry.userId === selfUserId) return null;
        if (entry.x == null || entry.y == null) return null;

        const screenX = (entry.x - viewport.x) * viewport.zoom;
        const screenY = (entry.y - viewport.y) * viewport.zoom;

        return (
          <div
            key={entry.userId}
            title={entry.name || entry.userId}
            style={{
              position: 'absolute',
              left: screenX,
              top: screenY,
              transform: 'translate(-50%, -50%)',
              fontSize: 10,
              color: '#64748b',
            }}
          >
            ▲
          </div>
        );
      })}
    </div>
  );
}
