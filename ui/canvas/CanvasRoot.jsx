'use client';

import { useCallback, useMemo, useRef } from 'react';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { useCanvasInteractions } from '@/ui/interactions/useCanvasInteractions.js';
import CanvasHost from '@/ui/canvas/CanvasHost.jsx';
import NodeLayer from '@/ui/canvas/NodeLayer.jsx';
import GuideLayer from '@/ui/canvas/GuideLayer.jsx';
import SelectionLayer from '@/ui/canvas/SelectionLayer.jsx';
import CanvasGhostLayer from '@/ui/canvas/CanvasGhostLayer.jsx';
import { CanvasProvider } from '@/ui/canvas/CanvasContext.jsx';
import { CanvasSurface } from '@/ui/canvas/surface/CanvasSurface.jsx';
import { WorldOriginMarker } from '@/ui/canvas/WorldOriginMarker.jsx';
import { getZoomTier } from '@/runtime/canvas/zoomTiers.js';
import { useWorkspaceViewState } from '@/runtime/projection';
import { useToolStore } from '@/ui/state/useToolStore.js';

function resolveWorldPointFromEvent(event, hostElement, viewport) {
    if (!hostElement || !event) {
        return { x: 0, y: 0 };
    }

    const rect = hostElement.getBoundingClientRect();
    const scale = viewport?.scale ?? 1;
    const safeScale = Number.isFinite(scale) && scale !== 0 ? scale : 1;
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;

    return {
        x: screenX / safeScale + (viewport?.x ?? 0),
        y: screenY / safeScale + (viewport?.y ?? 0),
    };
}

export default function CanvasRoot({ workspaceId = null }) {
    const hostRef = useRef(null);
    const viewState = useWorkspaceViewState((state) => state) ?? {};
    const viewport = viewState.viewport ?? { x: 0, y: 0, scale: 1 };
    const canvasSurface = viewState.canvasSurface ?? { type: 'smooth', snap: false };
    const zoomTier = getZoomTier(viewport.scale ?? 1);
    const activeTool = useToolStore((state) => state.activeTool ?? 'select');

    const getWorldPointFromEvent = useCallback(
        (event) => resolveWorldPointFromEvent(event, hostRef.current, viewport),
        [viewport],
    );

    const interactions = useCanvasInteractions({
        getActiveToolId: () => activeTool,
        getWorldPointFromEvent,
        getDefaultParentId: () => null,
    });

    const setCanvasSurface = useCallback((surface) => {
        if (!surface) return;

        canvasBus.emit('intent.workspace.canvasSurface.set', {
            workspaceId,
            surface,
        });
    }, [workspaceId]);

    const contextValue = useMemo(
        () => ({
            zoomTier,
            readOnly: false,
            viewStateOverride: null,
            visualStateOverride: null,
            animatedStateOverride: null,
            setCanvasSurface,
            onResizeHandlePointerDown: interactions.onResizeHandlePointerDown,
            onResizeHandlePointerMove: interactions.onResizeHandlePointerMove,
            onResizeHandlePointerUp: interactions.onResizeHandlePointerUp,
            onRotateHandlePointerDown: interactions.onRotateHandlePointerDown,
        }),
        [interactions, setCanvasSurface, zoomTier],
    );

    return (
        <CanvasProvider value={contextValue}>
            <CanvasHost
                ref={hostRef}
                viewport={viewport}
                worldOffset={{ x: 0, y: 0 }}
                cameraTransform={null}
                onPointerDown={interactions.onPointerDown}
                onPointerMove={interactions.onPointerMove}
                onPointerUp={interactions.onPointerUp}
                onPointerCancel={interactions.onPointerCancel}
            >
                <div style={{ position: 'absolute', inset: 0 }}>
                    <CanvasSurface surface={canvasSurface} viewport={viewport} />
                    <WorldOriginMarker viewport={viewport} />
                    <CanvasGhostLayer />
                    <GuideLayer />
                    <NodeLayer />
                    <SelectionLayer />
                </div>
            </CanvasHost>
        </CanvasProvider>
    );
}

export { useCanvasInteractions } from '@/ui/interactions/useCanvasInteractions.js';
