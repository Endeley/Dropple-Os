import { evaluateAnimationTrack } from './evaluateAnimationTrack.js';

/**
 * Pure evaluation of animation timeline at time t.
 *
 * Returns a projection:
 * {
 *   nodes: {
 *     [nodeId]: { prop: value }
 *   }
 * }
 */
export function evaluateAnimationTimeline({ animations, timeMs, clipId }) {
  if (
    !animations ||
    !animations.clips ||
    !animations.tracks ||
    !animations.keyframes
  ) {
    return { nodes: {} };
  }

  const { clips, tracks, keyframes } = animations;

  const activeClips = clipId
    ? [clips[clipId]].filter(Boolean)
    : Object.values(clips);

  const nodes = {};

  for (const clip of activeClips) {
    if (!clip || !Array.isArray(clip.trackIds)) continue;

    for (const trackId of clip.trackIds) {
      const track = tracks[trackId];
      if (!track) continue;

      const value = evaluateAnimationTrack({
        track,
        keyframesById: keyframes,
        timeMs,
      });

      if (value === undefined) continue;

      if (!nodes[track.nodeId]) {
        nodes[track.nodeId] = {};
      }

      nodes[track.nodeId][track.property] = value;
    }
  }

  return { nodes };
}
