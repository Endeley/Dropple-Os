export function createLessonVersion({
  lessonId,
  version,
  parentLessonId,
  changelog,
  createdAt = Date.now(),
}) {
  return {
    lessonId,
    version,
    parentLessonId,
    changelog,
    createdAt,
  };
}
