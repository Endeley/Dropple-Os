'use client';

import { mockLessons } from '@/marketplace/mockLessons';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';
import { normalizeEvents, snapshotToEvents } from '@/education/lessonEvents';

export default function LessonPlaybackPage({ params }) {
  const lesson = mockLessons.find((l) => l.id === params.lessonId);

  if (!lesson) return <div>Lesson not found</div>;

  const snapshotEvents = lesson.baseSnapshot
    ? snapshotToEvents(lesson.baseSnapshot)
    : [];
  const timelineEvents = normalizeEvents(lesson.eventTimeline || []);
  const educationEvents = normalizeEvents(lesson.educationEvents || []);
  const events = [...snapshotEvents, ...timelineEvents, ...educationEvents];

  return (
    <WorkspaceShell
      modeId="education"
      educationRole="teacher"
      educationInitialLocked={true}
      educationReadOnly={true}
      initialEvents={events}
      initialCursorIndex={-1}
      disableSeed={true}
    />
  );
}
