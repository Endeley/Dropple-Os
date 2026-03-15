'use client';

import { useRouter } from 'next/navigation';
import { mockLessons } from '@/marketplace/mockLessons';
import { colors, spacing, radius } from '@/ui/tokens';

export default function LessonCreatorPage({ params }) {
  const router = useRouter();
  const name = decodeURIComponent(params.name || '');
  const lessons = mockLessons.filter(
    (l) => l.metadata.creator?.name === name
  );

  return (
    <div style={{ padding: spacing.xl }}>
      <h2>{name}</h2>
      <p style={{ color: colors.textMuted }}>Lessons by this educator</p>

      <div
        style={{
          marginTop: spacing.lg,
          display: 'grid',
          gap: spacing.md,
        }}
      >
        {lessons.length ? (
          lessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => router.push(`/marketplace/lessons/${lesson.id}`)}
              style={{
                padding: spacing.md,
                border: `1px solid ${colors.border}`,
                borderRadius: radius.md,
                cursor: 'pointer',
                background: '#fff',
              }}
            >
              {lesson.metadata.title}
            </div>
          ))
        ) : (
          <div style={{ fontSize: 13, color: colors.textMuted }}>
            No lessons from this educator yet.
          </div>
        )}
      </div>
    </div>
  );
}
