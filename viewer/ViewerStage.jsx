'use client';

export function ViewerStage({ zoom, bg, children }) {
  const background =
    bg === 'dark'
      ? '#0f172a'
      : bg === 'transparent'
      ? 'transparent'
      : '#f8fafc';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'auto',
        background,
      }}
    >
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: '0 0',
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </div>
    </div>
  );
}
