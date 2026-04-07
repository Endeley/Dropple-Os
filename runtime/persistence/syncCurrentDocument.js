// runtime/persistence/syncCurrentDocument.js

import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * Explicitly sync the current runtime document to remote durable storage.
 *
 * 🔒 Rules:
 * - Manual call only
 * - Local replay snapshot remains canonical truth
 * - Remote storage is secondary sync/publish infrastructure
 */
export function useSyncCurrentDocument() {
    const save = useMutation(api.saveDocumentSnapshot);

    return async function syncCurrentDocument(runtimeSnapshot) {
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
