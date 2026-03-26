'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import CanvasHost from './CanvasHost.jsx';
import NodeLayer from './NodeLayer.jsx';
import GhostLayer from './GhostLayer.jsx';
import GhostFrameLayer from './GhostFrameLayer.jsx';
import MotionTrailLayer from './MotionTrailLayer.jsx';
import { BehaviorPreviewLayer } from '@/design/canvas/behaviorPreview/BehaviorPreviewLayer.jsx';
import ConstraintVisualizerLayer from './ConstraintVisualizerLayer.jsx';
import GuideLayer from './GuideLayer.jsx';
import GroupTransformOverlay from './GroupTransformOverlay.jsx';
import SelectionLayer from './SelectionLayer.jsx';
import RemoteCursors from './RemoteCursors.jsx';
import RemoteSelections from './RemoteSelections.jsx';

import TimelinePanel from '@/ui/timeline/TimelinePanel.jsx';
import { perfStart, perfEnd } from '@/ui/bridges/canvasRuntimeFacade.js';
import { useWorkspaceViewState, useWorkspaceVisualState } from '@/runtime/projection';
import { CanvasSurface } from '@/ui/canvas/surface/CanvasSurface.jsx';
import { WorldOriginMarker } from '@/ui/canvas/WorldOriginMarker.jsx';
import { computeCenteredViewport } from '@/ui/canvas/computeCenteredViewport.js';
import { screenToWorld } from '@/canvas/transform/screenToWorld.js';
import { viewportIntent } from '@/ui/viewport/viewportIntent.js';
import { getZoomTier } from '@/runtime/canvas/zoomTiers.js';
import { CanvasProvider } from '@/ui/canvas/CanvasContext.jsx';
import { canvasBus } from '../eventBus/canvasBus.js';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useToolStore } from '@/ui/state/useToolStore.js';
import { TOOL_DEFINITION_BY_ID } from '@/ui/tools/toolDefinitions';
import { useCanvasInteractions } from '@/ui/interactions/useCanvasInteractions.js';
import { resolveTargetNodeId } from '@/ui/interactions/resolveTargetNodeId.js';
import { getWorkspaceActivation } from '@/ui/bridges/workspaceActivationFacade.js';

/** precision safety */
const MIN_EFFECTIVE_ZOOM = 0.0005;
/** camera rebasing */
const REBASE_DISTANCE = 8000;

function isSelectionModifierGesture(event) {
    return event?.shiftKey === true || event?.metaKey === true || event?.ctrlKey === true;
}

export default function CanvasRoot({ workspaceId }) {
    perfStart('canvas.render');

    const projectedWorkspaceId = useWorkspaceViewState((s) => s.id);
    const rootIds = useWorkspaceVisualState((s) => s.rootIds || []);
    const resolvedWorkspaceId = workspaceId ?? projectedWorkspaceId;
    const workspace = getWorkspaceActivation(resolvedWorkspaceId);

    const viewport = useWorkspaceViewState((s) => s.viewport);
    const canvasSurface = useWorkspaceViewState((s) => s.canvasSurface);
    const projectedNodes = useWorkspaceVisualState((s) => s.nodes || {});
    const projectedTimeline = useWorkspaceVisualState((s) => s.timeline);
    const cameraTransform = useAnimatedRuntimeStore((s) => s.cameraTransform);
    const dragState = useRuntimeStore((state) => state.interaction?.drag ?? null);
    const activeTool = useToolStore((s) => s.activeTool);
    const canvasPolicy = workspace?.canvasPolicy;
    const designState = useMemo(
        () => ({
            nodes: projectedNodes ?? {},
            timeline: projectedTimeline ?? null,
        }),
        [projectedNodes, projectedTimeline],
    );

    const containerRef = useRef(null);
    const panRef = useRef({ active: false, x: 0, y: 0 });
    const hasCenteredRef = useRef(false);

    const [worldOffset, setWorldOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const isNodeDragging =
        dragState?.active === true &&
        (dragState?.type === 'move' || dragState?.type === 'resize' || dragState?.type === 'rotate');

    const {
        onPointerDown: onCanvasPointerDown,
        onPointerMove: onCanvasPointerMove,
        onPointerUp: onCanvasPointerUp,
        onPointerCancel: onCanvasPointerCancel,
        onResizeHandlePointerDown,
        onRotateHandlePointerDown,
    } = useCanvasInteractions({
        getActiveToolId: (event) => {
            const toolDef = TOOL_DEFINITION_BY_ID[activeTool];
            const targetNodeId = resolveTargetNodeId(event?.target ?? null, {
                x: event?.clientX,
                y: event?.clientY,
            });
            if (toolDef?.createsNode && (isSelectionModifierGesture(event) || targetNodeId)) {
                return 'select';
            }
            return activeTool;
        },
        getWorldPointFromEvent: (e) => {
            if (!viewport || !containerRef.current) {
                return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
            }
            const rect = containerRef.current.getBoundingClientRect();
            const screenPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            return screenToWorld(screenPoint, {
                ...viewport,
                x: viewport.x + worldOffset.x,
                y: viewport.y + worldOffset.y,
            });
        },
        getDefaultParentId: () => rootIds[0] ?? null,
    });

    const allowPan = canvasPolicy?.allowPan ?? true;
    const allowZoom = canvasPolicy?.allowZoom ?? true;

    const zoomTier = useMemo(() => getZoomTier(viewport?.scale ?? 1), [viewport?.scale]);

    function maybeRebase(nextViewport) {
        if (Math.abs(nextViewport.x) > REBASE_DISTANCE || Math.abs(nextViewport.y) > REBASE_DISTANCE) {
            setWorldOffset((prev) => ({
                x: prev.x + nextViewport.x,
                y: prev.y + nextViewport.y,
            }));

            viewportIntent({ viewport: { ...nextViewport, x: 0, y: 0 } });
            return true;
        }
        return false;
    }

    // 🖱️ PAN START
    function handlePointerDown(e) {
        if (!allowPan) return;

        const isMiddle = e.button === 1;
        const isLeft = e.button === 0;
        const isPanTool = activeTool === 'pan';

        if (!isMiddle && !(isLeft && isPanTool && !isNodeDragging)) return;

        panRef.current = {
            active: true,
            x: e.clientX,
            y: e.clientY,
        };

        setIsPanning(true);
        e.currentTarget.setPointerCapture?.(e.pointerId);
    }

    // 🖱️ PAN MOVE
    function handlePointerMove(e) {
        if (!allowPan || !panRef.current.active || !viewport) return;
        if ((e.buttons & 5) === 0) return;

        const dx = (e.clientX - panRef.current.x) / viewport.scale;
        const dy = (e.clientY - panRef.current.y) / viewport.scale;

        panRef.current.x = e.clientX;
        panRef.current.y = e.clientY;

        const nextViewport = {
            ...viewport,
            x: viewport.x - dx,
            y: viewport.y - dy,
        };

        if (!maybeRebase(nextViewport)) {
            viewportIntent({ type: 'pan', dx: -dx, dy: -dy });
        }
    }

    function handlePointerUp(e) {
        panRef.current.active = false;
        setIsPanning(false);
        e.currentTarget.releasePointerCapture?.(e.pointerId);
    }

    // 🔍 ZOOM
    function handleWheel(e) {
        if (!allowZoom || !viewport) return;
        e.preventDefault();

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const cursor = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        const worldBefore = screenToWorld(cursor, {
            ...viewport,
            x: viewport.x + worldOffset.x,
            y: viewport.y + worldOffset.y,
        });

        const zoomFactor = Math.exp(-e.deltaY * 0.001);
        let nextScale = viewport.scale * zoomFactor;

        if (nextScale < MIN_EFFECTIVE_ZOOM) nextScale *= 1000;
        nextScale = Math.min(32, Math.max(1e-9, nextScale));

        viewportIntent({
            type: 'zoom',
            scale: zoomFactor,
            anchor: worldBefore,
        });
    }

    // 🎯 RESET VIEW
    const handleResetView = useCallback(() => {
        if (!viewport || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const nextViewport = computeCenteredViewport({
            width: rect.width,
            height: rect.height,
            scale: viewport.scale,
        });

        if (!nextViewport) return;

        setWorldOffset({ x: 0, y: 0 });
        viewportIntent({ viewport: nextViewport });
    }, [viewport]);

    // 🔌 Listen for reset intent
    useEffect(() => {
        canvasBus.on('intent.viewport.reset', handleResetView);
        return () => canvasBus.off('intent.viewport.reset', handleResetView);
    }, [handleResetView]);

    // TEMP (dev-only): WordPress export determinism verification
    // (dev-only export verification hook removed)

    // 🧭 INITIAL CAMERA CENTER — IMPERATIVE, NOT AN EFFECT
    const handleCanvasMount = useCallback((el) => {
        if (hasCenteredRef.current) return;

        const rect = el.getBoundingClientRect();
        const scale = viewport?.scale ?? 1;

        const nextViewport = computeCenteredViewport({
            width: rect.width,
            height: rect.height,
            scale,
        });

        if (!nextViewport) return;

        setWorldOffset({ x: 0, y: 0 });
        viewportIntent({ viewport: nextViewport });

        hasCenteredRef.current = true;
    }, [viewport?.scale]);

    perfEnd('canvas.render');

    return (
        <CanvasProvider value={{ zoomTier, onResizeHandlePointerDown, onRotateHandlePointerDown }}>
            <CanvasHost
                ref={containerRef}
                onMount={handleCanvasMount}
                viewport={viewport}
                worldOffset={worldOffset}
                cameraTransform={cameraTransform}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={onCanvasPointerCancel}
                onWheel={handleWheel}>
                {/* 🌍 WORLD */}
                <div
                    style={{ position: 'absolute', inset: 0 }}
                    onPointerDown={onCanvasPointerDown}
                    onPointerMove={onCanvasPointerMove}
                    onPointerUp={onCanvasPointerUp}
                    onPointerCancel={onCanvasPointerCancel}>
                    <CanvasSurface surface={canvasSurface} viewport={viewport} emphasisMode={isNodeDragging ? 'drag' : isPanning ? 'pan' : 'none'} />
                    <WorldOriginMarker viewport={viewport} />
                    <GhostFrameLayer designState={designState} />
                    <MotionTrailLayer designState={designState} />
                    <ConstraintVisualizerLayer />
                    <NodeLayer />
                    <BehaviorPreviewLayer />
                    <GhostLayer />
                    <GuideLayer />
                    <GroupTransformOverlay />
                    <SelectionLayer />
                    <RemoteSelections />
                </div>

                {/* 🧭 UI */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <RemoteCursors />
                    {workspace?.capabilities?.timeline && (
                        <div style={{ pointerEvents: 'auto' }}>
                            <TimelinePanel designState={designState} />
                        </div>
                    )}
                </div>
            </CanvasHost>
        </CanvasProvider>
    );
}
