import { createShareLink } from '@/share/createShareLink';
import { addToGallery } from './galleryStore';
import { generateThumbnail } from './generateThumbnail';

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `gallery-${Math.random().toString(36).slice(2, 10)}`;
}

export async function publishCurrentDocument({
  title,
  description,
  events = [],
  cursorIndex = -1,
  nodes = {},
  tags = [],
  mode,
} = {}) {
  if (!title) return null;
  const url = createShareLink({ events, cursorIndex });
  const payload = url.split('#')[1] || '';
  const thumbnail = await generateThumbnail({ nodes });
  const normalizedTags = Array.isArray(tags)
    ? tags.map((tag) => tag.trim()).filter(Boolean)
    : [];

  const item = {
    id: createId(),
    title,
    description,
    payload,
    thumbnail,
    tags: normalizedTags,
    mode: mode || null,
    createdAt: Date.now(),
  };

  addToGallery(item);
  return item;
}
