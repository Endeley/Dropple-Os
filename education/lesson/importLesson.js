export function importLesson(json) {
  if (json.type !== 'dropple.lesson') {
    throw new Error('Invalid lesson format');
  }

  return json;
}
