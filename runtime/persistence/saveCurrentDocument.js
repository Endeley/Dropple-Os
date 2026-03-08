// persistence/saveCurrentDocument.js

import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * Explicitly persist the current runtime document to Convex.
 *
 * 🔒 Rules:
 * - Manual call only
 * - Runtime is source of truth
 */
export function useSaveCurrentDocument() {
    const save = useMutation(api.saveDocumentSnapshot);

    return async function saveCurrentDocument(runtimeSnapshot) {
        const doc = runtimeSnapshot?.document;

        if (!doc) {
            throw new Error('No active document to save');
        }

        const branches = Object.entries(doc.branches).map(([branchId, branch]) => ({
            branchId,
            base: branch.base,
            events: branch.events.map((e) => ({
                eventId: e.id,
                type: e.type,
                payload: e.payload,
                createdAt: e.createdAt ?? Date.now(),
            })),
        }));

        return save({
            docId: doc.id,
            currentBranch: doc.currentBranch,
            branches,
            timelines: runtimeSnapshot?.timeline ?? null,
            markers: runtimeSnapshot?.markers ?? null,
        });
    };
}
