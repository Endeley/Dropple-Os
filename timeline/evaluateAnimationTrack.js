import { sampleKeyframes } from './sampleKeyframes.js';

/**
 * Evaluates a single animation track at time t.
 */
export function evaluateAnimationTrack({ track, keyframesById, timeMs }) {
  if (!track || !track.keyframeIds?.length) return undefined;

  const keyframes = track.keyframeIds
    .map((id) => keyframesById[id])
    .filter(Boolean)
    .sort((a, b) => a.timeMs - b.timeMs);

  if (!keyframes.length) return undefined;

  return sampleKeyframes(keyframes, timeMs);
}
