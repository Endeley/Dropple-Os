'use client';

import { useAnnotations } from '@/certification/annotations/useAnnotationStore';
import { useEducationCursor } from '@/education/EducationCursorContext';

export default function TimelineBar({
  events = [],
  cursor,
  setCursorIndex,
  submissionId,
}) {
  const education = useEducationCursor();
  const locked = education?.locked ?? false;
  const role = education?.role ?? 'teacher';
  const canScrub = !locked || role === 'teacher';
  const hasEvents = events.length > 0;
  const max = events.length - 1;
  const { getAnnotationsForSubmission } = useAnnotations();
  const annotations = submissionId ? getAnnotationsForSubmission(submissionId) : [];

  function undo() {
    if (!canScrub) return;
    setCursorIndex((i) => Math.max(-1, i - 1));
  }

  function redo() {
    if (!canScrub) return;
    setCursorIndex((i) => Math.min(max, i + 1));
  }

  function scrub(e) {
    if (!canScrub) return;
    const value = Number(e.target.value);
    const next = Math.max(-1, Math.min(max, value));
    setCursorIndex(next);
  }

  return (
    <div className="timeline-bar">
      <button
        onClick={undo}
        disabled={!hasEvents || cursor.index <= -1 || !canScrub}
      >
        Undo
      </button>

      <button
        onClick={redo}
        disabled={!hasEvents || cursor.index >= max || !canScrub}
      >
        Redo
      </button>

      <div style={{ position: 'relative', flex: 1 }}>
        {annotations.map((a) => {
          if (!hasEvents || max <= 0) return null;
          const left = `${(a.cursorIndex / max) * 100}%`;
          return (
            <div
              key={a.id}
              style={{
                position: 'absolute',
                left,
                top: -6,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#2563eb',
              }}
            />
          );
        })}
        <input
          type="range"
          min={-1}
          max={max}
          value={cursor.index}
          onChange={scrub}
          disabled={!hasEvents || !canScrub}
          style={{ flex: 1, width: '100%' }}
        />
      </div>

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
