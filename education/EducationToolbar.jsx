'use client';

import { useEducationCursor } from './EducationCursorContext';

export function EducationToolbar({
  emit,
  cursor,
  events = [],
  selectedId = null,
  readOnly = false,
}) {
  const cursorState = useEducationCursor();

  if (!cursorState) return null;

  const { locked, setLocked, role } = cursorState;
  const isTeacher = role === 'teacher';
  const eventId = cursor?.index >= 0 ? events[cursor.index]?.id ?? null : null;

  function addAnnotation() {
    if (!isTeacher || readOnly) return;
    emit({
      type: 'education.annotation.add',
      payload: {
        id: crypto.randomUUID(),
        time: cursor.index,
        nodeId: selectedId || null,
        x: 40,
        y: 40,
        text: 'Annotation',
        author: 'teacher',
      },
    });
  }

  function addExplanation() {
    if (!isTeacher || readOnly) return;
    emit({
      type: 'education.explanation.add',
      payload: {
        id: crypto.randomUUID(),
        time: cursor.index,
        eventId,
        text: 'Explanation',
      },
    });
  }

  return (
    <div
      className="toolbar"
      style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        padding: '0 var(--space-lg)',
        borderBottom: '1px solid var(--border-default)',
        background: 'var(--surface-1)',
      }}
    >
      <strong style={{ fontSize: 13 }}>Education Mode</strong>
      <button
        onClick={() => setLocked((v) => !v)}
        disabled={!isTeacher}
        style={{
          minWidth: 32,
          height: 32,
          padding: '0 var(--space-sm)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--surface-1)',
          color: 'var(--text-primary)',
          fontSize: 12,
        }}
      >
        {locked ? 'Unlock Timeline' : 'Lock Timeline'}
      </button>
      {!readOnly ? (
        <>
          <button
            onClick={addAnnotation}
            disabled={!isTeacher}
            style={{
              minWidth: 32,
              height: 32,
              padding: '0 var(--space-sm)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-1)',
              color: 'var(--text-primary)',
              fontSize: 12,
            }}
          >
            Add Annotation
          </button>
          <button
            onClick={addExplanation}
            disabled={!isTeacher}
            style={{
              minWidth: 32,
              height: 32,
              padding: '0 var(--space-sm)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-1)',
              color: 'var(--text-primary)',
              fontSize: 12,
            }}
          >
            Add Explanation
          </button>
        </>
      ) : null}
    </div>
  );
}
