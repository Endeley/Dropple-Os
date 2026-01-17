// collab/useLiveCursors.js

import { useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { throttle } from '@/collab/throttle';

/**
 * N2 CURSOR SHARING
 *
 * Cursor positions are advisory only.
 * They must never:
 * - snap to objects
 * - affect hit testing
 * - influence selection or transforms
 */
export function useLiveCursors({ docId, enabled = true, toCanvasCoords }) {
    const updateCursor = useMutation(api.updateCursor);
    const presence = useQuery(api.getPresence, { docId }) ?? [];

    useEffect(() => {
        if (!docId || !enabled || !toCanvasCoords) return;

        // Throttle is intentional.
        // Cursor smoothness is less important than network safety.
        const emit = throttle((x, y) => {
            updateCursor({ docId, x, y }).catch(() => {});
        }, 50);

        const onMove = (e) => {
            const point = toCanvasCoords(e);
            if (!point) return;
            emit(point.x, point.y);
        };

        window.addEventListener('pointermove', onMove);
        return () => window.removeEventListener('pointermove', onMove);
    }, [docId, enabled, toCanvasCoords, updateCursor]);

    return presence;
}
