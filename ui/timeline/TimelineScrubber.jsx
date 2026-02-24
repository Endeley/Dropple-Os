'use client';

import { useTimelineStore } from '@/runtime/stores/useTimelineStore.js';

export default function TimelineScrubber({
  duration,
  frameTime,
  onScrub,
  onScrubStart,
  onScrubEnd,
}) {
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
        value={frameTime}
        onMouseDown={handleScrubStart}
        onMouseUp={handleScrubEnd}
        onChange={handleScrubChange}
        style={{ width: '100%' }}
      />
      <div style={{ fontSize: 12, marginTop: 4 }}>
        Time: {frameTime} ms / {duration} ms
      </div>
    </div>
  );
}
