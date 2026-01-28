'use client';

import { usePresenceStore } from '@/collab/presenceStore';
import { SelectionOutline } from './SelectionOutline';
import { useCanvasContext } from '@/ui/canvas/CanvasContext.jsx';

/**
 * UI-only rendering of other users' selections.
 */
export default function RemoteSelections() {
    const selections = usePresenceStore((s) => s.selections);
    const users = usePresenceStore((s) => s.users);
    const { zoomTier } = useCanvasContext();

    if (zoomTier === 'far' || zoomTier === 'overview') return null;

    return Object.entries(selections).flatMap(([userId, nodeIds]) => {
        const user = users[userId];
        if (!user || !Array.isArray(nodeIds)) return [];
        return nodeIds.map((id) => <SelectionOutline key={`${userId}-${id}`} nodeId={id} color={user.color} />);
    });
}
