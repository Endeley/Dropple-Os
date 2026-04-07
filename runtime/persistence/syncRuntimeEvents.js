// runtime/persistence/syncRuntimeEvents.js

import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * Append newly committed runtime events to remote durable storage.
 *
 * 🔒 Rules:
 * - Call explicitly
 * - Append-only
 * - Idempotent
 * - Secondary to local canonical replay truth
 */
export function useSyncRuntimeEvents() {
    const append = useMutation(api.appendEvents);

    return async function syncRuntimeEvents(events, runtimeSnapshot) {
        if (!Array.isArray(events) || events.length === 0) return;

        const doc = runtimeSnapshot?.document;
        if (!doc) {
            throw new Error('No active document');
        }

        const branchId = doc.currentBranch;

        const payload = events.map((e) => ({
            eventId: e.id,
            type: e.type,
            payload: e.payload,
            createdAt: e.createdAt ?? Date.now(),
        }));

        return append({
            docId: doc.id,
            branchId,
            events: payload,
        });
    };
}
