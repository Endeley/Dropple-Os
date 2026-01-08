export function measureToCanvas(node) {
  return [
    { label: `${node.x}px`, x1: 0, y1: node.y, x2: node.x, y2: node.y },
    { label: `${node.y}px`, x1: node.x, y1: 0, x2: node.x, y2: node.y },
  ];
}
