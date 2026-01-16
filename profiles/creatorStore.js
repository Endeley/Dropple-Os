const KEY = 'dropple.creators';

export function loadCreators() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || '{}');
  } catch (err) {
    console.warn('[creatorStore] load failed', err);
    return {};
  }
}

export function saveCreators(map) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(map || {}));
}

export function upsertCreator(profile) {
  if (!profile?.id) return;
  const map = loadCreators();
  map[profile.id] = { ...map[profile.id], ...profile };
  saveCreators(map);
}

export function getCreator(id) {
  if (!id) return null;
  return loadCreators()[id] || null;
}
