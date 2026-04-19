'use client';

function clampCursorIndex(value, max) {
  if (!Number.isInteger(value)) return -1;
  return Math.max(-1, Math.min(max, value));
}

export function ViewerTimelineBar({
  events = [],
  cursorIndex = -1,
  onSeek,
}) {
  const hasEvents = events.length > 0;
  const max = events.length - 1;
  const safeCursorIndex = clampCursorIndex(cursorIndex, max);

  function handleUndo() {
    if (!hasEvents) return;
    onSeek?.(safeCursorIndex - 1);
  }

  function handleRedo() {
    if (!hasEvents) return;
    onSeek?.(safeCursorIndex + 1);
  }

  function handleScrub(event) {
    if (!hasEvents) return;
    onSeek?.(Number(event.target.value));
  }

  return (
    <div className='timeline-bar'>
      <button onClick={handleUndo} disabled={!hasEvents || safeCursorIndex <= -1}>
        Undo
      </button>

      <button onClick={handleRedo} disabled={!hasEvents || safeCursorIndex >= max}>
        Redo
      </button>

      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
        }}>
        {!hasEvents && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: 10,
              right: 10,
              height: 2,
              background: '#e2e8f0',
              opacity: 0.9,
            }}
          />
        )}

        <input
          type='range'
          min={-1}
          max={max}
          value={safeCursorIndex}
          onChange={handleScrub}
          disabled={!hasEvents}
          style={{
            flex: 1,
            width: '100%',
            opacity: hasEvents ? 1 : 0.6,
          }}
        />
      </div>

      <span
        style={{
          marginLeft: 8,
          fontSize: 12,
          opacity: 0.7,
        }}>
        {hasEvents ? `${safeCursorIndex + 1} / ${events.length}` : 'Drag to begin'}
      </span>
    </div>
  );
}
