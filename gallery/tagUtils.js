export function collectTags(items = []) {
  const set = new Set();
  items.forEach((item) => {
    (item.tags || []).forEach((tag) => {
      if (tag) set.add(tag);
    });
  });
  return Array.from(set).sort();
}

export function filterByTags(items = [], activeTags = []) {
  if (!activeTags.length) return items;
  return items.filter((item) =>
    item.tags?.some((tag) => activeTags.includes(tag))
  );
}

export function filterByMode(items = [], mode) {
  if (!mode) return items;
  return items.filter((item) => item.mode === mode);
}

export function filterBySearch(items = [], query) {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter(
    (item) =>
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
  );
}
