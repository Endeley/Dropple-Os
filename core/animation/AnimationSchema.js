export const AnimationProperties = Object.freeze([
  "x",
  "y",
  "opacity",
  "scale",
  "rotation",
  "width",
  "height",
]);

export const AnimationEasings = Object.freeze([
  "linear",
  "ease-in",
  "ease-out",
  "ease-in-out",
]);

export function createKeyframe({ id, timeMs, value, easing = "linear" }) {
  if (!id || typeof timeMs !== "number") return null;

  return {
    id,
    timeMs,
    value,
    easing,
  };
}

export function createAnimationTrack({
  id,
  nodeId,
  property,
  keyframes = [],
}) {
  if (!id || !nodeId || !property) return null;

  return {
    id,
    nodeId,
    property,
    keyframes,
  };
}

export function createAnimationClip({ id, durationMs, tracks = [] }) {
  if (!id || typeof durationMs !== "number") return null;

  return {
    id,
    durationMs,
    tracks,
  };
}

export function createAnimationTimeline({ clips = [] }) {
  return {
    clips,
  };
}
