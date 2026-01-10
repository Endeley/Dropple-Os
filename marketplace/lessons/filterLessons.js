export function filterLessons(lessons, filters) {
  return lessons.filter((lesson) => {
    const { metadata } = lesson;
    const title = metadata.title || '';

    if (
      filters.query &&
      !title.toLowerCase().includes(filters.query.toLowerCase())
    ) {
      return false;
    }

    if (filters.level !== 'all' && metadata.level !== filters.level) {
      return false;
    }

    if (filters.duration !== 'all') {
      const d = metadata.duration || '';
      if (filters.duration === 'short' && !d.includes('min')) return false;
      if (filters.duration === 'medium' && !d.includes('min')) return false;
      if (filters.duration === 'long' && !d.includes('min')) return false;
    }

    return true;
  });
}
