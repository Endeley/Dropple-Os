'use client';

import { SelectionOutline } from './SelectionOutline.jsx';
import { useWorkspaceVisualState } from '@/runtime/projection';
import { useCanvasContext } from '@/ui/canvas/CanvasContext.jsx';
import { useAvailability } from '@/ui/availability/useAvailability';
import { Availability } from '@/ui/availability/availability';
import { Capability } from '@/ui/capabilities/capabilityVocabulary';

export default function SelectionLayer() {
    const selection = useWorkspaceVisualState((s) => s.selection);
    const nodesById = useWorkspaceVisualState((s) => s.nodes || {});
    const { zoomTier } = useCanvasContext();
    const availability = useAvailability({ readCaps: [Capability.NODE_SELECT] });
    const selectionIds = selection?.ids;

    if (availability === Availability.HIDDEN) return null;
    if (zoomTier === 'far' || zoomTier === 'overview') return null;
    if (!Array.isArray(selectionIds) || selectionIds.length === 0) return null;

    return selectionIds.map((id) => {
        const node = nodesById?.[id];
        const resizeEnabled = Boolean(node?.layout?.autoLayout);
        return <SelectionOutline key={id} nodeId={id} resizeEnabled={resizeEnabled} />;
    });
}
