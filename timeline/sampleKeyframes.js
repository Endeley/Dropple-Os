import { applyEasing } from './easingMath.js';

/**
 * Samples numeric keyframes at time t.
 * Assumes keyframes are sorted by timeMs.
 */
export function sampleKeyframes(keyframes, timeMs) {
  if (!keyframes.length) return undefined;

  // Before first keyframe
  if (timeMs <= keyframes[0].timeMs) {
    return keyframes[0].value;
  }

  // After last keyframe
  const last = keyframes[keyframes.length - 1];
  if (timeMs >= last.timeMs) {
    return last.value;
  }

  // Between keyframes
  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i];
    const b = keyframes[i + 1];

    if (timeMs >= a.timeMs && timeMs <= b.timeMs) {
      const span = b.timeMs - a.timeMs;
      if (span === 0) return b.value;

      const rawT = (timeMs - a.timeMs) / span;
      const easedT = applyEasing(rawT, b.easing || 'linear');

      return a.value + (b.value - a.value) * easedT;
    }
  }

  return undefined;
}
