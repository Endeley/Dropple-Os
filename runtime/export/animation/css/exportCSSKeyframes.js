/**
 * Export animations to CSS keyframes.
 *
 * @param {Object} params
 * @param {Object} params.animations
 */
export function exportCSSKeyframes({ animations }) {
  const blocks = [];

  for (const clip of Object.values(animations.clips)) {
    const keyframesByProperty = {};

    for (const trackId of clip.trackIds) {
      const track = animations.tracks[trackId];
      if (!track) continue;

      const frames = track.keyframeIds
        .map((id) => animations.keyframes[id])
        .filter(Boolean)
        .sort((a, b) => a.timeMs - b.timeMs);

      keyframesByProperty[track.property] = frames.map((kf) => ({
        percent: (kf.timeMs / clip.durationMs) * 100,
        value: kf.value,
        easing: kf.easing,
      }));
    }

    blocks.push({
      clipId: clip.id,
      durationMs: clip.durationMs,
      keyframes: keyframesByProperty,
    });
  }

  return blocks;
}
