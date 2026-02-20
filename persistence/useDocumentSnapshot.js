import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * Pure infrastructure hook.
 *
 * 🔒 Rules:
 * - No dispatcher
 * - No runtime mutation
 * - No replay
 * - No orchestration
 */
export function useDocumentSnapshot(docId) {
    const snapshot = useQuery(api.loadDocumentSnapshot, { docId });

    if (snapshot === undefined) {
        return { status: 'loading' };
    }

    if (!snapshot) {
        return { status: 'not_found' };
    }

    return {
        status: 'ready',
        snapshot,
    };
}
