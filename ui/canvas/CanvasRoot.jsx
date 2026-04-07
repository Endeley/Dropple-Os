'use client';

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

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
import { CanvasSurfaceSwitcher } from '@/ui/canvas/surface/CanvasSurfaceSwitcher.jsx';
import { WorldOriginMarker } from '@/ui/canvas/WorldOriginMarker.jsx';
import { computeCenteredViewport } from '@/ui/canvas/computeCenteredViewport.js';
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
import { DispatcherContext } from '@/runtime/boundary/DispatcherContext.jsx';

/** precision safety */
const MIN_EFFECTIVE_ZOOM = 0.0005;
/** camera rebasing */
const REBASE_DISTANCE = 8000;

function isSelectionModifierGesture(event) {
    return event?.shiftKey === true || event?.metaKey === true || event?.ctrlKey === true;
}

function isTransformHandleEventTarget(target) {
    let current = target;

    while (current && !(current instanceof Element)) {
        current = current.parentNode;
    }

    return Boolean(
        current?.closest?.(
            '[data-testid="resize-handle"],[data-testid="rotate-handle"]',
        ),
    );
}

function isTransformHandleEvent(event) {
    if (isTransformHandleEventTarget(event?.target)) {
        return true;
    }

    if (
        typeof document === 'undefined' ||
        typeof document.elementsFromPoint !== 'function' ||
        !Number.isFinite(event?.clientX) ||
        !Number.isFinite(event?.clientY)
    ) {
        return false;
    }

    return document
        .elementsFromPoint(event.clientX, event.clientY)
        .some((element) =>
            element?.closest?.(
                '[data-testid="resize-handle"],[data-testid="rotate-handle"]',
            ),
        );
}

function screenToCanvasWorld(screenPoint, { viewport, worldOffset, cameraTransform }) {
    const cameraX = cameraTransform?.x ?? 0;
    const cameraY = cameraTransform?.y ?? 0;
    const cameraZoom = cameraTransform?.zoom ?? 1;
    const cameraRotation = cameraTransform?.rotation ?? 0;
    const baseScale = viewport?.scale ?? 1;
    const scale = baseScale * cameraZoom;
    const tx = (viewport?.x ?? 0) + (worldOffset?.x ?? 0) + cameraX;
    const ty = (viewport?.y ?? 0) + (worldOffset?.y ?? 0) + cameraY;

    const translatedX = screenPoint.x + tx;
    const translatedY = screenPoint.y + ty;
    const scaledX = translatedX / scale;
    const scaledY = translatedY / scale;

    if (cameraRotation === 0) {
        return { x: scaledX, y: scaledY };
    }

    const cos = Math.cos(-cameraRotation);
    const sin = Math.sin(-cameraRotation);
    return {
        x: scaledX * cos - scaledY * sin,
        y: scaledX * sin + scaledY * cos,
    };
}

export default function CanvasRoot({ workspaceId }) {
    perfStart('canvas.render');
    const dispatcher = useContext(DispatcherContext);
    if (!dispatcher) {
        throw new Error('[CanvasRoot] live canvas requires DispatcherContext');
    }

    const liveViewState = useWorkspaceViewState((s) => s);
    const liveVisualState = useWorkspaceVisualState((s) => s);
    const liveCameraTransform = useAnimatedRuntimeStore((s) => s.cameraTransform);
    const liveDragState = useRuntimeStore((state) => state.interaction?.drag ?? null);
    const liveActiveTool = useToolStore((s) => s.activeTool);
    const viewState = liveViewState;
    const visualState = liveVisualState;

    const projectedWorkspaceId = viewState?.id;
    const rootIds = visualState?.rootIds || [];
    const resolvedWorkspaceId = workspaceId ?? projectedWorkspaceId;
    const workspace = getWorkspaceActivation(resolvedWorkspaceId);

    const viewport = viewState?.viewport;
    const canvasSurface = viewState?.canvasSurface;
    const projectedNodes = visualState?.nodes || {};
    const projectedTimeline = visualState?.timeline;
    const cameraTransform = liveCameraTransform;
    const dragState = liveDragState;
    const activeTool = liveActiveTool;
    const canvasPolicy = viewState?.canvasPolicy ?? workspace?.canvasPolicy;
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
        onResizeHandlePointerMove,
        onResizeHandlePointerUp,
        onRotateHandlePointerDown,
    } = useCanvasInteractions({
        dispatcher,
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
            return screenToCanvasWorld(screenPoint, {
                viewport,
                worldOffset,
                cameraTransform,
            });
        },
        getDefaultParentId: () => rootIds[0] ?? null,
    });

    const allowPan = canvasPolicy?.allowPan ?? true;
    const allowZoom = canvasPolicy?.allowZoom ?? true;

    const setCanvasSurface = useCallback((nextSurface) => {
        canvasBus.emit('intent.workspace.canvasSurface.set', {
            surface: nextSurface,
        });
    }, []);

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

    function handleCanvasHostPointerDown(e) {
        if (isTransformHandleEvent(e)) {
            return;
        }
        handlePointerDown(e);
        if (panRef.current.active) return;
        onCanvasPointerDown(e);
    }

    function handleCanvasHostPointerMove(e) {
        if (panRef.current.active) {
            handlePointerMove(e);
            return;
        }
        onCanvasPointerMove(e);
    }

    function handleCanvasHostPointerUp(e) {
        if (panRef.current.active) {
            handlePointerUp(e);
            return;
        }
        onCanvasPointerUp(e);
    }

    function handleCanvasHostPointerCancel(e) {
        if (panRef.current.active) {
            handlePointerUp(e);
            return;
        }
        onCanvasPointerCancel(e);
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

        const worldBefore = screenToCanvasWorld(cursor, {
            viewport,
            worldOffset,
            cameraTransform,
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
        <CanvasProvider
            value={{
                zoomTier,
                readOnly: false,
                setCanvasSurface,
                onResizeHandlePointerDown,
                onResizeHandlePointerMove,
                onResizeHandlePointerUp,
                onRotateHandlePointerDown,
            }}
        >
            <CanvasHost
                ref={containerRef}
                onMount={handleCanvasMount}
                viewport={viewport}
                worldOffset={worldOffset}
                cameraTransform={cameraTransform}
                onPointerDown={handleCanvasHostPointerDown}
                onPointerMove={handleCanvasHostPointerMove}
                onPointerUp={handleCanvasHostPointerUp}
                onPointerCancel={handleCanvasHostPointerCancel}
                onWheel={handleWheel}>
                {/* 🌍 WORLD */}
                <div style={{ position: 'absolute', inset: 0 }}>
                    <CanvasSurface surface={canvasSurface} viewport={viewport} emphasisMode={isNodeDragging ? 'drag' : isPanning ? 'pan' : 'none'} />
                    <WorldOriginMarker viewport={viewport} />
                    <NodeLayer />
                    <GhostFrameLayer designState={designState} />
                    <MotionTrailLayer designState={designState} />
                    <ConstraintVisualizerLayer />
                    <BehaviorPreviewLayer />
                    <GhostLayer />
                    <GuideLayer />
                    <GroupTransformOverlay />
                    <SelectionLayer />
                    <RemoteSelections />
                </div>

                {/* 🧭 UI */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <>
                        <div
                            style={{
                                position: 'absolute',
                                top: 14,
                                left: 14,
                                zIndex: 40,
                            }}>
                            <CanvasSurfaceSwitcher />
                        </div>
                        <RemoteCursors />
                    </>
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
