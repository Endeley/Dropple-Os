// collab/useRemoteEventCommit.js

import { useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * Apply remote events into local runtime.
 *
 * 🔒 Rules:
 * - Idempotent by eventId
 * - Same dispatcher path as local events
 * - No direct state mutation
 */
export function useRemoteEventCommit({ docId, branchId, dispatcher }) {
    if (!dispatcher) {
        throw new Error('useRemoteEventCommit: dispatcher required');
    }

    const events = useQuery(api.streamEvents, {
        docId,
        branchId,
    });

    const appliedRef = useRef(new Set());

    useEffect(() => {
        if (!Array.isArray(events)) return;

        for (const evt of events) {
            if (appliedRef.current.has(evt.eventId)) continue;

            appliedRef.current.add(evt.eventId);

            dispatcher.dispatch({
                id: evt.eventId,
                type: evt.type,
                payload: evt.payload,
            });
        }
    }, [events, dispatcher]);
}
