'use client';

import CanvasSnapGuides from './CanvasSnapGuides.jsx';
import InsertionLine from './InsertionLine.jsx';
import FrameRulers from './FrameRulers.jsx';
import { useCharacterRenderNodes } from '@/runtime/characters/useCharacterRenderNodes.js';
import { useEffect, useRef, useState } from 'react';
import { getReorderPreviewOnly } from '@/ui/bridges/inputSessionRuntimeFacade.js';
import { useCanvasViewState, useCanvasVisualState } from '@/ui/canvas/CanvasContext.jsx';

export default function GuideLayer() {
    const nodes = useCharacterRenderNodes();
    const selectedIds = useCanvasVisualState((s) => s.selection?.ids || []);
    const guides = useCanvasVisualState((s) => s.guides || []);
    const marquee = useCanvasVisualState((s) => s.marquee ?? null);
    const viewport = useCanvasViewState((state) => state.viewport) || { x: 0, y: 0, scale: 1 };
    const [reorderPreview, setReorderPreview] = useState(null);
    const lastPreviewRef = useRef(null);

    useEffect(() => {
        let raf = null;

        const tick = () => {
            const preview = getReorderPreviewOnly();
            const next =
                preview?.containerId != null
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
            {marquee && (marquee.width > 0 || marquee.height > 0) && (
                <div
                    data-testid="marquee-selection"
                    style={{
                        position: 'absolute',
                        left: marquee.x,
                        top: marquee.y,
                        width: marquee.width,
                        height: marquee.height,
                        border: `1px dashed ${marquee.additive ? 'rgba(16,185,129,0.95)' : 'rgba(59,130,246,0.95)'}`,
                        background: marquee.additive ? 'rgba(16,185,129,0.10)' : 'rgba(59,130,246,0.10)',
                        boxShadow: marquee.additive
                            ? '0 0 0 1px rgba(16,185,129,0.18)'
                            : '0 0 0 1px rgba(59,130,246,0.18)',
                        pointerEvents: 'none',
                        zIndex: 2,
                    }}
                />
            )}
            <CanvasSnapGuides guides={guides} />
            {selectedFrame && <FrameRulers frame={selectedFrame} viewport={viewport} />}
            {reorderPreview && (
                <InsertionLine containerId={reorderPreview.containerId} index={reorderPreview.index} />
            )}
        </>
    );
}
