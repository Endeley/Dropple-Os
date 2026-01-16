'use client';

import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { createLocalDocumentSnapshot } from '@/persistence/localDocumentSchema';
import { generateThumbnail } from '@/gallery/generateThumbnail';

function dataUrlToBlob(dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    throw new Error('Invalid data URL');
  }

  const [meta, base64] = dataUrl.split(',');
  if (!meta || !base64) {
    throw new Error('Malformed data URL');
  }

  const match = meta.match(/data:(.*);base64/);
  if (!match) {
    throw new Error('Unsupported data URL encoding');
  }

  const mime = match[1] || 'application/octet-stream';
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}

async function uploadThumbnail(uploadUrl, dataUrl) {
  const blob = dataUrlToBlob(dataUrl);

  const upload = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': blob.type,
    },
    body: blob,
  });

  if (!upload.ok) {
    throw new Error('Thumbnail upload failed');
  }

  const payload = await upload.json();
  return payload.storageId ?? null;
}

export function usePublishToServer() {
  const generateUploadUrl = useMutation(api.gallery.generateGalleryUploadUrl);
  const publishGalleryItem = useMutation(api.gallery.publishGalleryItem);

  return async function publishToServer({
    title,
    description,
    tags,
    mode,
    nodes,
    events,
    cursorIndex,
  }) {
    const snapshot = createLocalDocumentSnapshot({
      events,
      cursorIndex,
      metadata: { mode },
    });

    let thumbnailStorageId = null;
    const thumbnail = await generateThumbnail({ nodes });
    if (thumbnail) {
      const uploadUrl = await generateUploadUrl();
      thumbnailStorageId = await uploadThumbnail(uploadUrl, thumbnail);
    }

    return await publishGalleryItem({
      snapshot,
      title,
      description,
      tags,
      mode,
      thumbnailStorageId,
    });
  };
}
