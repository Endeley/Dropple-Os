'use client';

import CanvasSnapGuides from './CanvasSnapGuides.jsx';
import InsertionLine from './InsertionLine.jsx';
import FrameRulers from './FrameRulers.jsx';
import { useCharacterRenderNodes } from '@/runtime/characters/useCharacterRenderNodes.js';
import { useWorkspaceProjection } from '@/runtime/projection';
import { useSelectionStore } from '@/runtime/stores/useSelectionStore.js';

export default function GuideLayer() {
    const nodes = useCharacterRenderNodes();
    const selectedIds = useSelectionStore((s) => s.selectedIds);
    const viewport = useWorkspaceProjection((state) => state.viewport) || { x: 0, y: 0, scale: 1 };

    let selectedFrame = null;
    if (Array.isArray(selectedIds) && selectedIds.length === 1) {
        const node = nodes[selectedIds[0]];
        if (node?.type === 'frame') {
            selectedFrame = node;
        }
    }

    return (
        <>
            <CanvasSnapGuides />
            {selectedFrame && <FrameRulers frame={selectedFrame} viewport={viewport} />}
            <InsertionLine />
        </>
    );
}
