/**
 * Export animations to Web Animations API format.
 *
 * @param {Object} params
 * @param {Object} params.animations
 */
export function exportWAAPI({ animations }) {
  const clips = [];

  for (const clip of Object.values(animations.clips)) {
    const tracks = [];

    for (const trackId of clip.trackIds) {
      const track = animations.tracks[trackId];
      if (!track) continue;

      const keyframes = track.keyframeIds
        .map((id) => animations.keyframes[id])
        .filter(Boolean)
        .sort((a, b) => a.timeMs - b.timeMs)
        .map((kf) => ({
          offset: kf.timeMs / clip.durationMs,
          value: kf.value,
          easing: kf.easing,
        }));

      tracks.push({
        nodeId: track.nodeId,
        property: track.property,
        keyframes,
      });
    }

    clips.push({
      id: clip.id,
      duration: clip.durationMs,
      tracks,
    });
  }

  return clips;
}
