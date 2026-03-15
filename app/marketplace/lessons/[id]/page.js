'use client';

import { useRouter } from 'next/navigation';
import { mockLessons } from '@/marketplace/mockLessons';
import { colors, spacing, radius } from '@/ui/tokens';

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
    <div style={{ padding: spacing.xl }}>
      <h2>{lesson.metadata.title}</h2>
      <p style={{ color: colors.textMuted }}>{lesson.metadata.description}</p>

      <div style={{ marginTop: spacing.sm }}>
        Level: {lesson.metadata.level} · {lesson.metadata.duration}
      </div>

      {lesson.metadata.goals?.length ? (
        <div style={{ marginTop: spacing.md }}>
          <div style={{ fontSize: 12, color: colors.textMuted }}>
            What you’ll learn
          </div>
          <ul style={{ marginTop: spacing.xs, paddingLeft: 18 }}>
            {lesson.metadata.goals.map((goal) => (
              <li key={goal} style={{ fontSize: 13 }}>
                {goal}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div style={{ marginTop: spacing.sm }}>
        By {lesson.metadata.creator.name}
      </div>

      <div style={{ marginTop: spacing.lg, display: 'flex', gap: spacing.sm }}>
        <button
          style={{
            minWidth: 32,
            height: 32,
            padding: `0 ${spacing.sm}px`,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.sm,
            background: '#fff',
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
            padding: `0 ${spacing.sm}px`,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.sm,
            background: '#fff',
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
