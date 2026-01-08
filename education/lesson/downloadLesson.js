export function downloadLesson(lesson) {
  const blob = new Blob(
    [JSON.stringify(lesson, null, 2)],
    { type: 'application/json' }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = `${lesson.meta.title || 'lesson'}.dropple.json`;
  a.click();

  URL.revokeObjectURL(url);
}
