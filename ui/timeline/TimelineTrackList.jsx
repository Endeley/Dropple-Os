'use client';

function TrackRow({ track, clipDurationMs, keyframes }) {
  const safeDuration = clipDurationMs > 0 ? clipDurationMs : 1;

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 12, color: '#0f172a' }}>
        {track.nodeId} · {track.property}
      </div>
      <div
        style={{
          position: 'relative',
          height: 16,
          background: '#f1f5f9',
          borderRadius: 4,
          marginTop: 4,
        }}
      >
        {keyframes.map((kf) => (
          <div
            key={kf.id}
            style={{
              position: 'absolute',
              left: `${(kf.timeMs / safeDuration) * 100}%`,
              top: 5,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#2563eb',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function TimelineTrackList({ animations }) {
  if (!animations?.tracks || !animations?.clips || !animations?.keyframes) {
    return null;
  }

  const rows = Object.values(animations.tracks)
    .map((track) => {
      const clip = animations.clips[track.clipId];
      if (!clip) return null;

      const keyframes = (track.keyframeIds || [])
        .map((id) => animations.keyframes[id])
        .filter(Boolean)
        .sort((a, b) => a.timeMs - b.timeMs);

      return {
        track,
        clipDurationMs: clip.durationMs || 0,
        keyframes,
      };
    })
    .filter(Boolean);

  if (!rows.length) return null;

  return (
    <div>
      {rows.map((row) => (
        <TrackRow
          key={row.track.id}
          track={row.track}
          clipDurationMs={row.clipDurationMs}
          keyframes={row.keyframes}
        />
      ))}
    </div>
  );
}
