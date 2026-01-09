export function GridOverlay({ node }) {
  const { x, y, width, height, autoLayout } = node.layout;
  if (autoLayout.type !== 'grid') return null;

  const { columns, gap, padding } = autoLayout;
  const colCount = Math.max(1, columns);
  const availableWidth = width - padding * 2 - gap * (colCount - 1);
  const cellW = availableWidth / colCount;

  const lines = [];

  for (let c = 1; c < colCount; c++) {
    const lx = x + padding + c * cellW + (c - 1) * gap;
    lines.push(
      <div
        key={`col-${c}`}
        style={{
          position: 'absolute',
          left: lx,
          top: y + padding,
          width: 1,
          height: height - padding * 2,
          background: 'rgba(59,130,246,0.3)',
        }}
      />
    );
  }

  return <>{lines}</>;
}
