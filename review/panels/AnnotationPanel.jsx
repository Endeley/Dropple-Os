'use client';

import { useAnnotations } from '@/certification/annotations/useAnnotationStore';

export default function AnnotationPanel({ submissionId, setCursorIndex }) {
  const { getAnnotationsForSubmission } = useAnnotations();
  const notes = submissionId ? getAnnotationsForSubmission(submissionId) : [];

  return (
    <div style={{ padding: 12 }}>
      <h3>Annotations</h3>

      {notes.length === 0 ? (
        <div style={{ fontSize: 12, color: '#64748b' }}>No annotations yet.</div>
      ) : (
        notes.map((a) => (
          <div
            key={a.id}
            style={{
              marginBottom: 8,
              padding: 8,
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              cursor: 'pointer',
            }}
            onClick={() => setCursorIndex?.(a.cursorIndex)}
          >
            <div style={{ fontSize: 11, color: '#64748b' }}>
              At step {a.cursorIndex + 1}
            </div>
            <div>{a.message}</div>
          </div>
        ))
      )}
    </div>
  );
}
