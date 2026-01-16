import { createLocalDocumentSnapshot, hydrateLocalDocumentSnapshot } from './localDocumentSchema';
import { saveDocumentFile, loadDocumentFile } from './documentFiles';
import { addToRegistry } from './documentRegistry';
import { setActiveDocument } from './activeDocument';

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `doc-${Math.random().toString(36).slice(2, 10)}`;
}

export function saveDocumentSnapshot({ id, name = 'Untitled', events = [], cursorIndex = -1 } = {}) {
  const docId = id || createId();
  const snapshot = createLocalDocumentSnapshot({
    events,
    cursorIndex,
    metadata: { name },
  });

  saveDocumentFile(docId, snapshot);
  addToRegistry({ id: docId, name, updatedAt: Date.now() });
  setActiveDocument(docId);

  return { id: docId, snapshot };
}

export function loadDocumentSnapshot(id) {
  const raw = loadDocumentFile(id);
  const hydrated = hydrateLocalDocumentSnapshot(raw);
  if (!hydrated) return null;
  return {
    id,
    name: raw?.metadata?.name || null,
    snapshot: hydrated,
  };
}
