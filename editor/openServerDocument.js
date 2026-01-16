import { hydrateLocalDocumentSnapshot } from '@/persistence/localDocumentSchema';
import { saveDocumentSnapshot } from '@/persistence/documentCommands';

export function openServerDocument(
  snapshot,
  { name, galleryItemId, ownerId } = {}
) {
  const hydrated = hydrateLocalDocumentSnapshot(snapshot);
  if (!hydrated) {
    throw new Error('Invalid snapshot');
  }

  const result = saveDocumentSnapshot({
    name: name || 'Untitled',
    events: hydrated.events,
    cursorIndex: hydrated.cursorIndex,
    metadata: {
      forkedFrom: 'gallery',
      forkedAt: Date.now(),
      galleryItemId: galleryItemId || null,
      ownerId: ownerId || null,
    },
  });

  return result.id;
}
