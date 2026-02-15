'use client';

import { SelectionOutline } from './SelectionOutline.jsx';
import { useSelectionStore } from '@/selection/useSelectionStore.js';
import { useCanvasContext } from '@/ui/canvas/CanvasContext.jsx';
import { useAvailability } from '@/ui/availability/useAvailability';
import { Availability } from '@/ui/availability/availability';
import { Capability } from '@/ui/capabilities/capabilityVocabulary';

export default function SelectionLayer() {
    const selected = useSelectionStore((s) => s.selectedIds);
    const { zoomTier } = useCanvasContext();
    const availability = useAvailability({ readCaps: [Capability.NODE_SELECT] });

    if (availability === Availability.HIDDEN) return null;
    if (zoomTier === 'far' || zoomTier === 'overview') return null;

    return selected.map((id) => <SelectionOutline key={id} nodeId={id} />);
}
