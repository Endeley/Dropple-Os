export function roundWorld(value) {
  return Math.round(value * 2) / 2;
}

export function roundPoint(point) {
  return {
    x: roundWorld(point.x),
    y: roundWorld(point.y),
  };
}
