'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function useGalleryIdentity() {
  return useQuery(api.gallery.getGalleryIdentity);
}
