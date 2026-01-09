export function computeFlexReorderIndex({ parent, children, cursor }) {
  const auto = parent.layout.autoLayout;
  const isRow = auto.direction === 'row';

  let best = 0;
  let minDist = Infinity;

  children.forEach((child, i) => {
    const cx = child.layout.x + child.layout.width / 2;
    const cy = child.layout.y + child.layout.height / 2;
    const dist = isRow
      ? Math.abs(cursor.x - cx)
      : Math.abs(cursor.y - cy);

    if (dist < minDist) {
      minDist = dist;
      best = i;
    }
  });

  return best;
}

export function computeGridReorderIndex({ parent, children, cursor }) {
  const { autoLayout, width } = parent.layout;
  const { columns, gap, padding } = autoLayout;

  const colCount = Math.max(1, columns);
  const cellW = (width - padding * 2 - gap * (colCount - 1)) / colCount;

  const col = Math.max(
    0,
    Math.min(
      colCount - 1,
      Math.floor((cursor.x - padding) / (cellW + gap))
    )
  );

  const rowHeight = (children[0]?.layout.height || 1) + gap;
  const row = Math.max(0, Math.floor((cursor.y - padding) / rowHeight));

  return row * colCount + col;
}
