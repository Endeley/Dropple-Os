export function computeBounds(node) {
  const layout = node?.layout || {};
  const x = layout.x ?? node?.x ?? 0;
  const y = layout.y ?? node?.y ?? 0;
  const width = layout.width ?? node?.width ?? 0;
  const height = layout.height ?? node?.height ?? 0;

  return {
    minX: x,
    minY: y,
    maxX: x + width,
    maxY: y + height,
  };
}
