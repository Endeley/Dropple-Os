'use client';

import { useTimelineStore } from '@/runtime/stores/useTimelineStore.js';

export default function TimelineScrubber({
  duration,
  currentTime,
  onScrub,
  onScrubStart,
  onScrubEnd,
}) {
  const setTime = useTimelineStore((s) => s.setTime);
  const startScrub = useTimelineStore((s) => s.startScrub);
  const endScrub = useTimelineStore((s) => s.endScrub);

  function handleScrubStart() {
    startScrub?.();
    onScrubStart?.();
  }

  function handleScrubEnd() {
    endScrub?.();
    onScrubEnd?.();
  }

  function handleScrubChange(e) {
    const next = Number(e.target.value);
    setTime?.(next);
    onScrub?.(next);
  }

  return (
    <div
      style={{
        padding: 8,
        borderTop: '1px solid #e5e7eb',
        background: '#f8fafc',
      }}
    >
      <input
        type="range"
        min={0}
        max={duration}
        value={currentTime}
        onMouseDown={handleScrubStart}
        onMouseUp={handleScrubEnd}
        onChange={handleScrubChange}
        style={{ width: '100%' }}
      />
      <div style={{ fontSize: 12, marginTop: 4 }}>
        Time: {currentTime} ms / {duration} ms
      </div>
    </div>
  );
}
