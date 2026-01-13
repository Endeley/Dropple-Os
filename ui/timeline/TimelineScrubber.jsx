'use client';

export default function TimelineScrubber({
  duration,
  currentTime,
  onScrub,
  onScrubStart,
  onScrubEnd,
}) {
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
        onMouseDown={onScrubStart}
        onMouseUp={onScrubEnd}
        onChange={(e) => onScrub(Number(e.target.value))}
        style={{ width: '100%' }}
      />
      <div style={{ fontSize: 12, marginTop: 4 }}>
        Time: {currentTime} ms / {duration} ms
      </div>
    </div>
  );
}
