// collab/useLiveCursors.js

import { useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * Live cursor hook.
 *
 * 🔒 Canvas-only
 * 🔒 No engine coupling
 */
export function useLiveCursors({ docId, userId }) {
    const updateCursor = useMutation(api.updateCursor);
    const presence = useQuery(api.getPresence, { docId }) ?? [];

    useEffect(() => {
        if (!docId || !userId) return;

        let lastSent = 0;

        const onMove = (e) => {
            const now = performance.now();
            if (now - lastSent < 50) return;
            lastSent = now;

            updateCursor({
                docId,
                userId,
                x: e.clientX,
                y: e.clientY,
            });
        };

        window.addEventListener('pointermove', onMove);
        return () => window.removeEventListener('pointermove', onMove);
    }, [docId, userId, updateCursor]);

    return presence.filter((p) => p.userId !== userId);
}
