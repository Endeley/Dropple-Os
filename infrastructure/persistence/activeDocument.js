const ACTIVE_KEY = 'dropple.activeDocument';

export function setActiveDocument(id) {
  if (typeof window === 'undefined') return;
  if (!id) return;
  window.localStorage.setItem(ACTIVE_KEY, id);
}

export function getActiveDocument() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACTIVE_KEY);
}

export function clearActiveDocument() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACTIVE_KEY);
}
