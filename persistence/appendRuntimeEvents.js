// persistence/appendRuntimeEvents.js

import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { getRuntimeState } from '@/runtime/state/runtimeState';

/**
 * Append newly committed runtime events to Convex.
 *
 * 🔒 Rules:
 * - Call explicitly
 * - Append-only
 * - Idempotent
 */
export function useAppendRuntimeEvents() {
    const append = useMutation(api.appendEvents);

    return async function appendRuntimeEvents(events) {
        if (!Array.isArray(events) || events.length === 0) return;

        const state = getRuntimeState();
        const doc = state?.document;
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
