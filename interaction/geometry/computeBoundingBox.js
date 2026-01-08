export function computeBoundingBox(nodes) {
  const xs = [];
  const ys = [];

  for (const n of nodes) {
    xs.push(n.x, n.x + n.width);
    ys.push(n.y, n.y + n.height);
  }

  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}
