// collab/useSelectionPresence.js

import { useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useSelectionStore } from '@/selection/useSelectionStore.js';

/**
 * Broadcast and receive selection presence.
 *
 * 🔒 UI-only
 * 🔒 No engine coupling
 */
export function useSelectionPresence({ docId, userId }) {
    const updateSelection = useMutation(api.updateSelection);
    const presence = useQuery(api.getPresence, { docId }) ?? [];

    const selectedIds = useSelectionStore((s) => s.selectedIds ?? []);

    // Broadcast local selection
    useEffect(() => {
        if (!docId || !userId) return;

        updateSelection({
            docId,
            userId,
            selectedNodeIds: selectedIds,
        });
    }, [docId, userId, selectedIds, updateSelection]);

    // Return remote selections only
    return presence.filter(
        (p) => p.userId !== userId && Array.isArray(p.selectedNodeIds) && p.selectedNodeIds.length > 0
    );
}
