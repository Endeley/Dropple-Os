'use client';

import { useEducationCursor } from './EducationCursorContext';
import { colors, spacing, radius } from '@/ui/tokens';

export function EducationToolbar({
  emit,
  cursor,
  events = [],
  selectedId = null,
}) {
  const cursorState = useEducationCursor();

  if (!cursorState) return null;

  const { locked, setLocked, role } = cursorState;
  const isTeacher = role === 'teacher';
  const eventId = cursor?.index >= 0 ? events[cursor.index]?.id ?? null : null;

  function addAnnotation() {
    if (!isTeacher) return;
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
    if (!isTeacher) return;
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
        gap: spacing.md,
        padding: `0 ${spacing.lg}px`,
        borderBottom: `1px solid ${colors.border}`,
        background: '#fff',
      }}
    >
      <strong style={{ fontSize: 13 }}>Education Mode</strong>
      <button
        onClick={() => setLocked((v) => !v)}
        disabled={!isTeacher}
        style={{
          minWidth: 32,
          height: 32,
          padding: `0 ${spacing.sm}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          background: '#fff',
          fontSize: 12,
        }}
      >
        {locked ? 'Unlock Timeline' : 'Lock Timeline'}
      </button>
      <button
        onClick={addAnnotation}
        disabled={!isTeacher}
        style={{
          minWidth: 32,
          height: 32,
          padding: `0 ${spacing.sm}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          background: '#fff',
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
          padding: `0 ${spacing.sm}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          background: '#fff',
          fontSize: 12,
        }}
      >
        Add Explanation
      </button>
    </div>
  );
}
