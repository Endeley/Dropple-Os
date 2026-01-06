// collab/usePresence.js

import { useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * Live presence hook.
 *
 * 🔒 Rules:
 * - UI-only
 * - Auto-heartbeat
 * - No engine coupling
 */
export function usePresence({ docId, userId, name, color }) {
    const update = useMutation(api.updatePresence);
    const presence = useQuery(api.getPresence, { docId });

    useEffect(() => {
        if (!docId || !userId) return;

        const tick = () => {
            update({ docId, userId, name, color });
        };

        tick();
        const id = setInterval(tick, 3000);

        return () => clearInterval(id);
    }, [docId, userId, name, color, update]);

    return presence ?? [];
}
