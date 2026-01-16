'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function useDocumentRole(docId) {
  return useQuery(
    api.collaboration.getMyRoleForDocument,
    docId ? { docId } : 'skip'
  );
}
