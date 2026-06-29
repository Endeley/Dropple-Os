'use client';

import { useEffect, useMemo } from 'react';
import CanvasRoot from '@/ui/canvas/CanvasRoot.jsx';
import CanvasHost from '@/ui/canvas/CanvasHost.jsx';
import HomeLandmark from '@/ui/canvas/HomeLandmark.jsx';
import NodeLayer from '@/ui/canvas/NodeLayer.jsx';
import { CanvasProvider } from '@/ui/canvas/CanvasContext.jsx';
import { CanvasSurface } from '@/ui/canvas/surface/CanvasSurface.jsx';
import { WorldOriginMarker } from '@/ui/canvas/WorldOriginMarker.jsx';
import { getZoomTier } from '@/runtime/canvas/zoomTiers.js';
import { useReplayState } from '@/runtime/replay/useReplayState.js';
import { useWorkspaceViewState } from '@/runtime/projection';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { getWorkspaceActivation } from '@/ui/bridges/workspaceActivationFacade.js';
import { workspaceIntentSetActive } from '@/ui/workspace/workspaceIntent.js';

function buildReplayVisualState(replayState) {
    return {
        nodes: replayState?.nodes ?? {},
        rootIds: replayState?.rootIds ?? [],
        sceneGraph: replayState?.sceneGraph ?? null,
        timeline: replayState?.timeline ?? null,
        selection: { ids: [], primary: null, count: 0 },
        selectionBounds: { bounds: null, center: null },
        transformAnchors: { pivot: null, resizeAnchors: null, rotateAnchor: null },
        guides: [],
        marquee: null,
        groupTransform: null,
        graph: null,
    };
}

function ReadOnlyReplayCanvasAdapter({
    replayState,
    viewState,
    animatedState,
}) {
    const viewport = viewState?.viewport;
    const canvasSurface = viewState?.canvasSurface;
    const cameraTransform = animatedState?.cameraTransform ?? null;
    const zoomTier = useMemo(() => getZoomTier(viewport?.scale ?? 1), [viewport?.scale]);
    const visualStateOverride = useMemo(
        () => buildReplayVisualState(replayState),
        [replayState],
    );
    const contextValue = useMemo(
        () => ({
            zoomTier,
            readOnly: true,
            viewStateOverride: viewState,
            visualStateOverride,
            animatedStateOverride: animatedState,
            setCanvasSurface: null,
            onResizeHandlePointerDown: null,
            onResizeHandlePointerMove: null,
            onResizeHandlePointerUp: null,
            onRotateHandlePointerDown: null,
        }),
        [animatedState, viewState, visualStateOverride, zoomTier],
    );

    return (
        <CanvasProvider value={contextValue}>
            <CanvasHost
                viewport={viewport}
                worldOffset={{ x: 0, y: 0 }}
                cameraTransform={cameraTransform}
                background={<CanvasSurface surface={canvasSurface} viewport={viewport} />}>
                <div style={{ position: 'absolute', inset: 0 }}>
                    <HomeLandmark workspaceId={viewState?.id ?? null} viewport={viewport} />
                    <WorldOriginMarker workspaceId={viewState?.id ?? null} viewport={viewport} />
                    <NodeLayer />
                </div>
            </CanvasHost>
        </CanvasProvider>
    );
}

function ReadOnlyRuntimeCanvasAdapter() {
    const viewState = useWorkspaceViewState((state) => state) ?? {};
    const viewport = viewState.viewport ?? { x: 0, y: 0, scale: 1 };
    const canvasSurface = viewState.canvasSurface ?? { type: 'smooth', snap: false };
    const cameraTransform = useAnimatedRuntimeStore((state) => state.cameraTransform ?? null);
    const zoomTier = useMemo(() => getZoomTier(viewport?.scale ?? 1), [viewport?.scale]);
    const contextValue = useMemo(
        () => ({
            zoomTier,
            readOnly: true,
            viewStateOverride: null,
            visualStateOverride: null,
            animatedStateOverride: null,
            setCanvasSurface: null,
            onResizeHandlePointerDown: null,
            onResizeHandlePointerMove: null,
            onResizeHandlePointerUp: null,
            onRotateHandlePointerDown: null,
        }),
        [zoomTier],
    );

    return (
        <CanvasProvider value={contextValue}>
            <CanvasHost
                viewport={viewport}
                worldOffset={{ x: 0, y: 0 }}
                cameraTransform={cameraTransform}
                background={<CanvasSurface surface={canvasSurface} viewport={viewport} />}>
                <div style={{ position: 'absolute', inset: 0 }}>
                    <HomeLandmark viewport={viewport} />
                    <WorldOriginMarker viewport={viewport} />
                    <NodeLayer />
                </div>
            </CanvasHost>
        </CanvasProvider>
    );
}

export function WorkspaceCanvasRoot({
    workspaceId = null,
    modeId = null,
    events = null,
    cursor = null,
    readOnly = false,
    runtimeReadOnly = false,
}) {
    useEffect(() => {
        if (!workspaceId) return;

        workspaceIntentSetActive({
            workspaceId,
        });
    }, [workspaceId]);

    const replayState = useReplayState({ events, cursor });
    const workspace = useMemo(
        () => getWorkspaceActivation(workspaceId),
        [workspaceId],
    );
    const hasReplaySource = readOnly && Array.isArray(events) && cursor != null;
    const viewState = useMemo(() => ({
        id: workspaceId,
        viewport: { x: 0, y: 0, scale: 1 },
        canvasSurface: workspace?.canvasSurface ?? { type: 'smooth', snap: false },
        canvasPolicy: { allowPan: true, allowZoom: true },
    }), [workspace, workspaceId]);
    const animatedState = useMemo(
        () => ({
            previewNodes: {},
            cameraTransform: null,
        }),
        [],
    );

    if (readOnly && runtimeReadOnly) {
        return <ReadOnlyRuntimeCanvasAdapter />;
    }

    if (!hasReplaySource) {
        return <CanvasRoot workspaceId={workspaceId} modeId={modeId} />;
    }

    return (
        <ReadOnlyReplayCanvasAdapter
            replayState={replayState}
            viewState={viewState}
            animatedState={animatedState}
        />
    );
}

export default WorkspaceCanvasRoot;
