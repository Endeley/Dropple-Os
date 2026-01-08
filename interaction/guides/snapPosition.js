const SNAP_DISTANCE = 6;

export function snapValue(value, candidates) {
  for (const c of candidates) {
    if (Math.abs(value - c) <= SNAP_DISTANCE) {
      return c;
    }
  }
  return value;
}
