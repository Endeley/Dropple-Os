const STORAGE_KEY = 'dropple.document.snapshot';

export function saveLocalDocument(snapshot) {
    if (typeof window === 'undefined') return;
    if (!snapshot) return;

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (err) {
        console.warn('[localDocumentStore] save failed', err);
    }
}

export function loadLocalDocument() {
    if (typeof window === 'undefined') return null;

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch (err) {
        console.warn('[localDocumentStore] load failed', err);
        return null;
    }
}

export function clearLocalDocument() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_KEY);
}
