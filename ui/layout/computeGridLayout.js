export function computeGridLayout(container, children) {
  const { autoLayout, width } = container.layout;
  const { columns, gap, padding } = autoLayout;

  const colCount = Math.max(1, columns);
  const availableWidth = width - padding * 2 - gap * (colCount - 1);
  const cellWidth = availableWidth / colCount;

  let x = padding;
  let y = padding;
  let col = 0;
  let rowMaxHeight = 0;

  return children.map((child) => {
    const pos = {
      nodeId: child.id,
      x,
      y,
    };

    rowMaxHeight = Math.max(rowMaxHeight, child.layout.height);

    col += 1;
    if (col >= colCount) {
      col = 0;
      x = padding;
      y += rowMaxHeight + gap;
      rowMaxHeight = 0;
    } else {
      x += cellWidth + gap;
    }

    return pos;
  });
}
