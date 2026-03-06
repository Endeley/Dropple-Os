export function computeAlignmentBounds(nodes = []) {
  if (!Array.isArray(nodes) || nodes.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    const layout = node?.layout || {};
    const x = layout.x ?? node?.x ?? 0;
    const y = layout.y ?? node?.y ?? 0;
    const width = layout.width ?? node?.width ?? 0;
    const height = layout.height ?? node?.height ?? 0;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  const width = maxX - minX;
  const height = maxY - minY;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
    centerX: minX + width / 2,
    centerY: minY + height / 2,
  };
}
