'use client';

import CanvasSnapGuides from './CanvasSnapGuides.jsx';
import InsertionLine from './InsertionLine.jsx';
import FrameRulers from './FrameRulers.jsx';
import { useCharacterRenderNodes } from '@/runtime/characters/useCharacterRenderNodes.js';
import { useWorkspaceProjection } from '@/runtime/projection';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useEffect, useRef, useState } from 'react';
import { getPreview } from '@/runtime/interactions/input/InputSessionManager.js';

export default function GuideLayer() {
    const nodes = useCharacterRenderNodes();
    const selectedIds = useRuntimeStore((s) => s.selection?.ids || []);
    const viewport = useWorkspaceProjection((state) => state.viewport) || { x: 0, y: 0, scale: 1 };
    const [reorderPreview, setReorderPreview] = useState(null);
    const lastPreviewRef = useRef(null);

    useEffect(() => {
        let raf = null;

        const tick = () => {
            const preview = getPreview();
            const next =
                preview?.type === 'reorder-preview' && preview.containerId != null
                    ? { containerId: preview.containerId, index: preview.index }
                    : null;

            const nextKey = next ? `${next.containerId}:${next.index ?? ''}` : '';
            if (lastPreviewRef.current !== nextKey) {
                lastPreviewRef.current = nextKey;
                setReorderPreview(next);
            }

            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => {
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

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
            {reorderPreview && (
                <InsertionLine containerId={reorderPreview.containerId} index={reorderPreview.index} />
            )}
        </>
    );
}
