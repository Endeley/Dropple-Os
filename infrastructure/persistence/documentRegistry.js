const REGISTRY_KEY = 'dropple.documents';

export function loadRegistry() {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(REGISTRY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[documentRegistry] load failed', err);
    return [];
  }
}

export function saveRegistry(list) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(REGISTRY_KEY, JSON.stringify(list || []));
}

export function addToRegistry(entry) {
  if (!entry?.id) return;
  const list = loadRegistry();
  const existing = list.find((d) => d.id === entry.id);

  const updated = existing
    ? list.map((d) => (d.id === entry.id ? entry : d))
    : [entry, ...list];

  saveRegistry(updated);
}

export function removeFromRegistry(id) {
  if (!id) return;
  saveRegistry(loadRegistry().filter((d) => d.id !== id));
}
