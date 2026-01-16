import { createLocalDocumentSnapshot } from '@/persistence/localDocumentSchema';

function encodePayload(payload) {
  const json = JSON.stringify(payload);
  return btoa(encodeURIComponent(json));
}

export function createShareLink({ events = [], cursorIndex = -1, origin } = {}) {
  const snapshot = createLocalDocumentSnapshot({
    events,
    cursorIndex,
  });

  const encoded = encodePayload(snapshot);
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/viewer#${encoded}`;
}
