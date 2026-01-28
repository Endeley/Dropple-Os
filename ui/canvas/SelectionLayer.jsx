'use client';

import { SelectionOutline } from './SelectionOutline.jsx';
import { useSelectionStore } from '@/selection/useSelectionStore.js';
import { useCanvasContext } from '@/ui/canvas/CanvasContext.jsx';

export default function SelectionLayer() {
    const selected = useSelectionStore((s) => s.selectedIds);
    const { zoomTier } = useCanvasContext();

    if (zoomTier === 'far' || zoomTier === 'overview') return null;

    return selected.map((id) => <SelectionOutline key={id} nodeId={id} />);
}
