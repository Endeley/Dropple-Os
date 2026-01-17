// collab/usePresence.js

import { useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * N2 AWARENESS ONLY
 *
 * This hook emits presence heartbeats.
 * It must never:
 * - depend on editor state
 * - block user actions
 * - trigger document mutations
 */
export function usePresence({ docId, enabled = true }) {
    const update = useMutation(api.updatePresence);
    const presence = useQuery(api.getPresence, docId ? { docId } : 'skip');

    useEffect(() => {
        if (!docId || !enabled) return;

        // NOTE: Do not tighten interval without profiling.
        // Presence should remain low-frequency and cheap.
        const tick = () => {
            update({ docId }).catch(() => {});
        };

        tick();
        const id = setInterval(tick, 5000);

        return () => clearInterval(id);
    }, [docId, enabled, update]);

    return presence ?? [];
}
