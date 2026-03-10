/**
 * Export animations to Web Animations API format.
 *
 * @param {Object} params
 * @param {Object} params.motion
 */
export function exportWAAPI({ motion }) {
  const clips = [];

  for (const clip of Object.values(motion?.clips || {})) {
    const duration = (clip.keyframes || []).reduce(
      (max, keyframe) => Math.max(max, keyframe?.t || 0),
      0,
    );
    const keyframes = (clip.keyframes || [])
      .slice()
      .sort((a, b) => a.t - b.t)
      .map((kf) => ({
        offset: duration > 0 ? kf.t / duration : 0,
        value: kf.v,
        easing: kf.easing,
      }));
    clips.push({
      id: clip.id,
      duration,
      tracks: [
        {
          nodeId: clip.target,
          property: clip.property,
          keyframes,
        },
      ],
    });
  }

  return clips;
}
