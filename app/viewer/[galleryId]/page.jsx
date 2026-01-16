import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import ViewerClient from './ViewerClient';

export default async function GalleryViewerPage({ params }) {
  const galleryItem = await fetchQuery(api.gallery.getGalleryItemById, {
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

  return (
    <ViewerClient
      snapshot={galleryItem.snapshot}
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
