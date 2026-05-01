import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { normalizeArtifact } from '@/gallery/artifacts/normalizeArtifact.js';
import { isTestGalleryFixtureId, loadTestGalleryFixture } from '@/gallery/testGalleryFixtureStore.js';
import ViewerClient from './ViewerClient';

export default async function GalleryViewerPage({ params }) {
  const galleryItem = isTestGalleryFixtureId(params.galleryId)
    ? loadTestGalleryFixture(params.galleryId)
    : await fetchQuery(api.gallery.getGalleryItemById, {
        galleryItemId: params.galleryId,
      });

  if (!galleryItem) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Not found</h2>
        <p>This gallery item does not exist.</p>
      </div>
    );
  }

  const artifact = normalizeArtifact(galleryItem.artifact ?? galleryItem, {
    source: 'viewer page artifact',
  });

  return (
    <ViewerClient
      artifact={artifact}
      meta={{
        id: galleryItem.id,
        title: galleryItem.title,
        description: galleryItem.description,
        thumbnailUrl: galleryItem.thumbnailUrl,
        ownerId: galleryItem.ownerId,
      }}
    />
  );
}
