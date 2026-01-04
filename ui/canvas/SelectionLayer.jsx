'use client';

import { SelectionOutline } from './SelectionOutline.jsx';
import { useSelectionStore } from '@/selection/useSelectionStore.js';

export default function SelectionLayer() {
    const selected = useSelectionStore((s) => s.selectedIds);

    return selected.map((id) => <SelectionOutline key={id} nodeId={id} />);
}
