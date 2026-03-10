/**
 * Export animations to CSS keyframes.
 *
 * @param {Object} params
 * @param {Object} params.motion
 */
export function exportCSSKeyframes({ motion }) {
  const blocks = [];

  for (const clip of Object.values(motion?.clips || {})) {
    const frames = (clip.keyframes || [])
      .slice()
      .sort((a, b) => a.t - b.t);
    const durationMs = frames[frames.length - 1]?.t ?? 0;
    const keyframesByProperty = {
      [clip.property]: frames.map((kf) => ({
        percent: durationMs > 0 ? (kf.t / durationMs) * 100 : 0,
        value: kf.v,
        easing: kf.easing,
      })),
    };
    blocks.push({
      clipId: clip.id,
      durationMs,
      target: clip.target,
      keyframes: keyframesByProperty,
    });
  }

  return blocks;
}
