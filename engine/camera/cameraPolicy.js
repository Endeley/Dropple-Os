export function clampZoom(z) {
  const MIN = 0.1;
  const MAX = 10;

  return Math.max(MIN, Math.min(MAX, z));
}
