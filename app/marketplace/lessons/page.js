'use client';

import { useRouter } from 'next/navigation';
import { mockLessons } from '@/marketplace/mockLessons';
import { useLessonFilters } from '@/marketplace/lessons/useLessonFilters';
import LessonFilterBar from '@/marketplace/lessons/LessonFilterBar';
import { filterLessons } from '@/marketplace/lessons/filterLessons';
import { lessonCollections } from '@/marketplace/lessons/lessonCollections';

export default function LessonsPage() {
  const router = useRouter();
  const filters = useLessonFilters();
  const visibleLessons = filterLessons(mockLessons, filters);

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      <h2>Lessons</h2>

      <LessonFilterBar {...filters} />

      <h3 style={{ marginTop: 'var(--space-lg)' }}>Curated Paths</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 'var(--space-md)',
          marginTop: 'var(--space-sm)',
        }}
      >
        {lessonCollections.map((collection) => (
          <div
            key={collection.id}
            style={{
              padding: 'var(--space-md)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-1)',
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 600 }}>{collection.title}</div>
            <div style={{ marginTop: 'var(--space-xs)', color: 'var(--text-muted)' }}>
              {collection.lessonIds.length} lessons
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 'var(--space-lg)',
          display: 'grid',
          gap: 'var(--space-md)',
        }}
      >
        {visibleLessons.length ? (
          visibleLessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => router.push(`/marketplace/lessons/${lesson.id}`)}
              style={{
                padding: 'var(--space-md)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                background: 'var(--surface-1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-xs)',
              }}
            >
              <strong>{lesson.metadata.title}</strong>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {lesson.metadata.description}
              </div>
              <div style={{ marginTop: 'var(--space-xs)', fontSize: 11 }}>
                By {lesson.metadata.creator.name}
              </div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            No lessons found.
          </div>
        )}
      </div>
    </div>
  );
}
