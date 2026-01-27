export function snapToGrid(value, size) {
  return Math.round(value / size) * size;
}

export function resolveGridSnapPosition({ x, y, size }) {
  return {
    x: snapToGrid(x, size),
    y: snapToGrid(y, size),
  };
}

export function resolveGridSnapSize({ width, height, size }) {
  return {
    width: snapToGrid(width, size),
    height: snapToGrid(height, size),
  };
}
