'use client';

import { SelectionOutline } from './SelectionOutline.jsx';
import { useCanvasContext, useCanvasVisualState } from '@/ui/canvas/CanvasContext.jsx';
import { useAvailability } from '@/ui/availability/useAvailability';
import { Availability } from '@/ui/availability/availability';
import { Capability } from '@/ui/capabilities/capabilityVocabulary';

export default function SelectionLayer() {
    const selection = useCanvasVisualState((s) => s.selection);
    const nodesById = useCanvasVisualState((s) => s.nodes || {});
    const { zoomTier, readOnly } = useCanvasContext();
    const availability = useAvailability({ readCaps: [Capability.NODE_SELECT] });
    const selectionIds = selection?.ids;

    if (availability === Availability.HIDDEN) return null;
    if (readOnly) return null;
    if (zoomTier === 'far' || zoomTier === 'overview') return null;
    if (!Array.isArray(selectionIds) || selectionIds.length === 0) return null;

    const isSingleSelection = selectionIds.length === 1;

    return selectionIds.map((id) => {
        const node = nodesById?.[id];
        const resizeEnabled = isSingleSelection && !node?.resizeLocked;
        const rotateEnabled = isSingleSelection;
        return (
            <SelectionOutline
                key={id}
                nodeId={id}
                isPrimary={selection?.primary === id}
                resizeEnabled={resizeEnabled}
                rotateEnabled={rotateEnabled}
            />
        );
    });
}
