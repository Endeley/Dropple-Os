import { hydrateLocalDocumentSnapshot } from '@/infrastructure/persistence/localDocumentSchema.js';
import { saveLocalDocumentSnapshot } from '@/infrastructure/persistence/documentCommands.js';

export function openServerDocument(
  snapshot,
  { name, galleryItemId, ownerId } = {}
) {
  const hydrated = hydrateLocalDocumentSnapshot(snapshot);
  if (!hydrated) {
    throw new Error('Invalid snapshot');
  }

  const result = saveLocalDocumentSnapshot({
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
