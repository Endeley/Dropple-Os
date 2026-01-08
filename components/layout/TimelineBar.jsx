'use client';

export default function TimelineBar({ events = [], cursor, setCursorIndex }) {
  const hasEvents = events.length > 0;
  const max = events.length - 1;

  function undo() {
    setCursorIndex((i) => Math.max(-1, i - 1));
  }

  function redo() {
    setCursorIndex((i) => Math.min(max, i + 1));
  }

  function scrub(e) {
    const value = Number(e.target.value);
    const next = Math.max(-1, Math.min(max, value));
    setCursorIndex(next);
  }

  return (
    <div className="timeline-bar">
      <button onClick={undo} disabled={!hasEvents || cursor.index <= -1}>
        Undo
      </button>

      <button onClick={redo} disabled={!hasEvents || cursor.index >= max}>
        Redo
      </button>

      <input
        type="range"
        min={-1}
        max={max}
        value={cursor.index}
        onChange={scrub}
        disabled={!hasEvents}
        style={{ flex: 1 }}
      />

      {hasEvents ? (
        <span>
          {cursor.index + 1} / {events.length}
        </span>
      ) : (
        <span>Empty document</span>
      )}
    </div>
  );
}
