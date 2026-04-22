'use client';

import { useRouter } from 'next/navigation';
import { mockLessons } from '@/marketplace/mockLessons';

export default function LessonCreatorPage({ params }) {
  const router = useRouter();
  const name = decodeURIComponent(params.name || '');
  const lessons = mockLessons.filter(
    (l) => l.metadata.creator?.name === name
  );

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      <h2>{name}</h2>
      <p style={{ color: 'var(--text-muted)' }}>Lessons by this educator</p>

      <div
        style={{
          marginTop: 'var(--space-lg)',
          display: 'grid',
          gap: 'var(--space-md)',
        }}
      >
        {lessons.length ? (
          lessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => router.push(`/marketplace/lessons/${lesson.id}`)}
              style={{
                padding: 'var(--space-md)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                background: 'var(--surface-1)',
              }}
            >
              {lesson.metadata.title}
            </div>
          ))
        ) : (
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            No lessons from this educator yet.
          </div>
        )}
      </div>
    </div>
  );
}
