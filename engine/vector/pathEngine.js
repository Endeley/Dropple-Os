export function rectanglePath(x, y, width, height) {
  return `M${x} ${y} L${x + width} ${y} L${x + width} ${y + height} L${x} ${y + height} Z`;
}

export function circlePath(cx, cy, radius) {
  return `M${cx - radius} ${cy} a ${radius} ${radius} 0 1 0 ${radius * 2} 0 a ${radius} ${radius} 0 1 0 -${radius * 2} 0`;
}

export function linePath(x1, y1, x2, y2) {
  return `M${x1} ${y1} L${x2} ${y2}`;
}
