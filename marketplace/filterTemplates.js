export function filterTemplates(templates, filters) {
  return templates.filter((tpl) => {
    const { metadata } = tpl;
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

    if (filters.tag !== 'all' && !metadata.tags?.includes(filters.tag)) {
      return false;
    }

    return true;
  });
}
