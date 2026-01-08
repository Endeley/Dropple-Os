export function applyLayout(el, layout = {}) {
  const {
    position,
    x,
    y,
    width,
    height,
    display,
    flexDirection,
    justifyContent,
    alignItems,
    gap,
    padding,
    gridTemplateColumns,
    gridTemplateRows,
  } = layout;

  if (position != null) el.style.position = position || '';
  if (x != null) el.style.left = `${x}px`;
  if (y != null) el.style.top = `${y}px`;
  if (width != null) el.style.width = `${width}px`;
  if (height != null) el.style.height = `${height}px`;

  if (display != null) el.style.display = display || '';
  if (flexDirection != null) el.style.flexDirection = flexDirection || '';
  if (justifyContent != null) el.style.justifyContent = justifyContent || '';
  if (alignItems != null) el.style.alignItems = alignItems || '';
  if (gap != null) el.style.gap = `${gap}px`;
  if (padding != null) el.style.padding = `${padding}px`;
  if (gridTemplateColumns != null) {
    el.style.gridTemplateColumns = gridTemplateColumns || '';
  }
  if (gridTemplateRows != null) {
    el.style.gridTemplateRows = gridTemplateRows || '';
  }
}
