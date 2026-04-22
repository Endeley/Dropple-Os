'use client';

import { useRouter } from 'next/navigation';
import { mockLessons } from '@/marketplace/mockLessons';

export default function LessonDetailPage({ params }) {
  const router = useRouter();
  const lesson = mockLessons.find((l) => l.id === params.id);

  if (!lesson) return <div>Lesson not found</div>;

  function startLesson() {
    router.push(`/education/${lesson.id}`);
  }

  function practiceLesson() {
    router.push(`/workspace/new?fromLesson=${lesson.id}`);
  }

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      <h2>{lesson.metadata.title}</h2>
      <p style={{ color: 'var(--text-muted)' }}>{lesson.metadata.description}</p>

      <div style={{ marginTop: 'var(--space-sm)' }}>
        Level: {lesson.metadata.level} · {lesson.metadata.duration}
      </div>

      {lesson.metadata.goals?.length ? (
        <div style={{ marginTop: 'var(--space-md)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            What you’ll learn
          </div>
          <ul style={{ marginTop: 'var(--space-xs)', paddingLeft: 18 }}>
            {lesson.metadata.goals.map((goal) => (
              <li key={goal} style={{ fontSize: 13 }}>
                {goal}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div style={{ marginTop: 'var(--space-sm)' }}>
        By {lesson.metadata.creator.name}
      </div>

      <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-sm)' }}>
        <button
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
          onClick={startLesson}
        >
          Start Lesson
        </button>
        <button
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
          onClick={practiceLesson}
        >
          Practice this Lesson
        </button>
      </div>
    </div>
  );
}
