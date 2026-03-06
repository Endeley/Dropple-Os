'use client';

import { SelectionOutline } from './SelectionOutline.jsx';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useCanvasContext } from '@/ui/canvas/CanvasContext.jsx';
import { useAvailability } from '@/ui/availability/useAvailability';
import { Availability } from '@/ui/availability/availability';
import { Capability } from '@/ui/capabilities/capabilityVocabulary';

export default function SelectionLayer() {
    const selected = useRuntimeStore((s) => s.selection?.ids || []);
    const { zoomTier } = useCanvasContext();
    const availability = useAvailability({ readCaps: [Capability.NODE_SELECT] });

    if (availability === Availability.HIDDEN) return null;
    if (zoomTier === 'far' || zoomTier === 'overview') return null;

    return selected.map((id) => <SelectionOutline key={id} nodeId={id} />);
}
