const KEY = 'dropple.currentCreator';

export function getCurrentCreatorId() {
  if (typeof window === 'undefined') return null;
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = crypto?.randomUUID ? crypto.randomUUID() : `creator-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(KEY, id);
  }
  return id;
}

export function setCurrentCreatorId(id) {
  if (typeof window === 'undefined') return;
  if (!id) return;
  window.localStorage.setItem(KEY, id);
}
