const keyFor = (id) => `dropple.document.${id}`;

export function saveDocumentFile(id, snapshot) {
  if (typeof window === 'undefined') return;
  if (!id || !snapshot) return;
  window.localStorage.setItem(keyFor(id), JSON.stringify(snapshot));
}

export function loadDocumentFile(id) {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(keyFor(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[documentFiles] load failed', err);
    return null;
  }
}

export function deleteDocumentFile(id) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(keyFor(id));
}
