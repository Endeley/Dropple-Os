const KEY = 'dropple.gallery';

export function loadGallery() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY) || '[]';
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[galleryStore] load failed', err);
    return [];
  }
}

export function saveGallery(items) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(items || []));
}

export function addToGallery(item) {
  if (!item?.id) return;
  const list = loadGallery();
  saveGallery([item, ...list]);
}
