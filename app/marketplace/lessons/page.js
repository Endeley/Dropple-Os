'use client';

import { useRouter } from 'next/navigation';
import { mockLessons } from '@/marketplace/mockLessons';
import { colors, spacing, radius } from '@/ui/tokens';
import { useLessonFilters } from '@/marketplace/lessons/useLessonFilters';
import LessonFilterBar from '@/marketplace/lessons/LessonFilterBar';
import { filterLessons } from '@/marketplace/lessons/filterLessons';
import { lessonCollections } from '@/marketplace/lessons/lessonCollections';

export default function LessonsPage() {
  const router = useRouter();
  const filters = useLessonFilters();
  const visibleLessons = filterLessons(mockLessons, filters);

  return (
    <div style={{ padding: spacing.xl }}>
      <h2>Lessons</h2>

      <LessonFilterBar {...filters} />

      <h3 style={{ marginTop: spacing.lg }}>Curated Paths</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: spacing.md,
          marginTop: spacing.sm,
        }}
      >
        {lessonCollections.map((collection) => (
          <div
            key={collection.id}
            style={{
              padding: spacing.md,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.md,
              background: '#fff',
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 600 }}>{collection.title}</div>
            <div style={{ marginTop: spacing.xs, color: colors.textMuted }}>
              {collection.lessonIds.length} lessons
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: spacing.lg,
          display: 'grid',
          gap: spacing.md,
        }}
      >
        {visibleLessons.length ? (
          visibleLessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => router.push(`/marketplace/lessons/${lesson.id}`)}
              style={{
                padding: spacing.md,
                border: `1px solid ${colors.border}`,
                borderRadius: radius.md,
                cursor: 'pointer',
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.xs,
              }}
            >
              <strong>{lesson.metadata.title}</strong>
              <div style={{ fontSize: 12, color: colors.textMuted }}>
                {lesson.metadata.description}
              </div>
              <div style={{ marginTop: spacing.xs, fontSize: 11 }}>
                By {lesson.metadata.creator.name}
              </div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 13, color: colors.textMuted }}>
            No lessons found.
          </div>
        )}
      </div>
    </div>
  );
}
