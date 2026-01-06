// persistence/saveCurrentDocument.js

import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { getRuntimeState } from '@/runtime/state/runtimeState';

/**
 * Explicitly persist the current runtime document to Convex.
 *
 * 🔒 Rules:
 * - Manual call only
 * - Runtime is source of truth
 */
export function useSaveCurrentDocument() {
    const save = useMutation(api.saveDocumentSnapshot);

    return async function saveCurrentDocument() {
        const state = getRuntimeState();
        const doc = state?.document;

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
            timelines: state.timeline ?? null,
            markers: state.markers ?? null,
        });
    };
}
