'use client';

import { useMemo } from 'react';
import { useTimelineSelectionStore } from '@/ui/timeline/useTimelineSelectionStore.js';
import { commitCurveChange } from '@/ui/animation/curves/commitCurveChange.js';
import { useDispatcher } from '@/ui/workspace/root/DispatcherProvider/DispatcherContext.jsx';

function normalizeEasingValue(easing) {
  if (easing && typeof easing === 'object' && easing.type === 'bezier') {
    return 'bezier';
  }
  return easing || 'linear';
}

function defaultBezier() {
  return {
    type: 'bezier',
    in: { x: 0.25, y: 0.25 },
    out: { x: 0.75, y: 0.75 },
  };
}

function TrackRow({ track, clipDurationMs, keyframes, frameTime, isSelected, readOnly = false }) {
  const dispatcher = useDispatcher();
  const safeDuration = clipDurationMs > 0 ? clipDurationMs : 1;
  const highlightWindowMs = 40;
  const selectSingle = useTimelineSelectionStore((s) => s.selectSingle);
  const isKeyframeSelected = useTimelineSelectionStore((s) => s.isSelected);
  const selectedKeyframeId = useTimelineSelectionStore((s) =>
    s.selectedKeyframeIds?.size === 1 ? Array.from(s.selectedKeyframeIds)[0] : null
  );

  const keyframeRows = useMemo(
    () =>
      keyframes.map((kf) => ({
        id: kf.id,
        timeMs: kf.timeMs,
        easingLabel: normalizeEasingValue(kf.easing),
      })),
    [keyframes]
  );

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
          (() => {
            const isNear = Number.isFinite(frameTime)
              ? Math.abs(kf.timeMs - frameTime) <= highlightWindowMs
              : false;
            const isHighlighted = isSelected && isNear;
            const isActive = isKeyframeSelected(kf.id);
            return (
          <div
            key={kf.id}
            onClick={() => selectSingle(kf.id)}
            style={{
              position: 'absolute',
              left: `${(kf.timeMs / safeDuration) * 100}%`,
              top: 5,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: isActive ? '#0f172a' : isHighlighted ? '#f97316' : '#2563eb',
              boxShadow: isActive
                ? '0 0 0 2px rgba(15, 23, 42, 0.35)'
                : isHighlighted
                ? '0 0 0 2px rgba(249, 115, 22, 0.35)'
                : 'none',
              cursor: 'pointer',
            }}
          />
            );
          })()
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
        {keyframeRows.map((row) => (
          <label key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <span style={{ color: row.id === selectedKeyframeId ? '#0f172a' : '#64748b' }}>
              {row.timeMs}ms
            </span>
            <select
              value={row.easingLabel}
              onChange={(e) => {
                if (readOnly) return;
                const next = e.target.value;
                const easing = next === 'bezier' ? defaultBezier() : next;
                commitCurveChange({ keyframeId: row.id, easing, dispatch: dispatcher.dispatch });
              }}
              disabled={readOnly}
              style={{
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
              }}
            >
              <option value="linear">linear</option>
              <option value="ease-in">ease-in</option>
              <option value="ease-out">ease-out</option>
              <option value="ease-in-out">ease-in-out</option>
              <option value="bezier">bezier</option>
            </select>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function TimelineTrackList({ animations, frameTime, selectedNodeId, readOnly = false }) {
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
          frameTime={frameTime}
          isSelected={row.track.nodeId === selectedNodeId}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
