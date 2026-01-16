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
        flex: 1,
        overflow: 'auto',
        background,
      }}
    >
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: '0 0',
          width: 'fit-content',
          height: 'fit-content',
        }}
      >
        {children}
      </div>
    </div>
  );
}
