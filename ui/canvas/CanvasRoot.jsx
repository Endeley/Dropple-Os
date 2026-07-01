'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { useCanvasInteractions } from '@/ui/interactions/useCanvasInteractions.js';

import CanvasHost from '@/ui/canvas/CanvasHost.jsx';
import NodeLayer from '@/ui/canvas/NodeLayer.jsx';
import GuideLayer from '@/ui/canvas/GuideLayer.jsx';
import SelectionLayer from '@/ui/canvas/SelectionLayer.jsx';
import CanvasGhostLayer from '@/ui/canvas/CanvasGhostLayer.jsx';
import SelectionContextMenu from '@/ui/canvas/SelectionContextMenu.jsx';
import { CanvasDebugOverlay } from '@/ui/canvas/CanvasDebugOverlay.jsx';
import { dispatchNodeDeleteSelection } from '@/ui/canvas/deleteSelection.js';
import { resolveSelectionContextMenuModel } from '@/runtime/grouping/contextMenuModel.js';

import { CanvasProvider } from '@/ui/canvas/CanvasContext.jsx';
import { CanvasSurface } from '@/ui/canvas/surface/CanvasSurface.jsx';
import HomeLandmark from '@/ui/canvas/HomeLandmark.jsx';
import FirstFrameAffordance from '@/ui/canvas/FirstFrameAffordance.jsx';
import { WorldOriginMarker } from '@/ui/canvas/WorldOriginMarker.jsx';
import { GraphicVocabularyOverlay } from '@/ui/workspace/graphic/GraphicVocabularyOverlay.jsx';
import { GraphicRefinementOverlay } from '@/ui/workspace/graphic/GraphicRefinementOverlay.jsx';
import { GraphicDeliveryOverlay } from '@/ui/workspace/graphic/GraphicDeliveryOverlay.jsx';

import { EventTypes } from '@/core/events/eventTypes.js';
import { getZoomTier } from '@/runtime/canvas/zoomTiers.js';
import { useDispatcher } from '@/runtime/boundary/DispatcherContext.jsx';
import {
    useWorkspaceProjectionState,
    useWorkspaceViewState,
    useWorkspaceVisualState,
} from '@/runtime/projection';
import { useToolStore } from '@/ui/state/useToolStore.js';
import { resolveTargetNodeId } from '@/ui/interactions/resolveTargetNodeId.js';
import { resolveSelectableGroupTarget } from '@/runtime/grouping/resolveSelectableGroupTarget.js';
import { runCommandIntent } from '@/ui/bridges/runtimeCommandFacade.js';
import {
    attachMotionClipToNode,
    getMotionClipsForNode,
    removeMotionClipsFromNode,
} from '@/ui/motion/motionClipActions.js';
import {
    hasProjectHistory,
    resolveArtifactFocusViewport,
    resolveCurrentFocus,
    resolveFirstRememberedArtifact,
    resolveProjectHome,
    resolveProjectHomeViewport,
    shouldInitializeProjectHomeViewport,
} from '@/runtime/workspaces/projectSubstrateNavigation.js';

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

const CONTEXT_MENU_PADDING = 12;
const CONTEXT_MENU_WIDTH = 168;
const CONTEXT_MENU_BASE_HEIGHT = 52;
const CONTEXT_MENU_ACTION_HEIGHT = 36;
const TOP_CONTROLS_SAFE_HEIGHT = 88;
const LEFT_DOCK_SAFE_WIDTH = 92;
const RIGHT_DOCK_SAFE_WIDTH = 320;
const BOTTOM_DOCK_SAFE_HEIGHT = 140;

function clampContextMenuPosition({
    x = 0,
    y = 0,
    rect,
    actionCount = 1,
    reserveRight = false,
    reserveBottom = false,
}) {
    if (!rect) {
        return { x, y };
    }

    const menuHeight = CONTEXT_MENU_BASE_HEIGHT + actionCount * CONTEXT_MENU_ACTION_HEIGHT;
    const maxX =
        rect.width -
        CONTEXT_MENU_WIDTH -
        CONTEXT_MENU_PADDING -
        (reserveRight ? RIGHT_DOCK_SAFE_WIDTH : 0);
    const maxY =
        rect.height -
        menuHeight -
        CONTEXT_MENU_PADDING -
        (reserveBottom ? BOTTOM_DOCK_SAFE_HEIGHT : 0);

    return {
        x: Math.max(CONTEXT_MENU_PADDING + LEFT_DOCK_SAFE_WIDTH, Math.min(x, maxX)),
        y: Math.max(TOP_CONTROLS_SAFE_HEIGHT, Math.min(y, maxY)),
    };
}

export default function CanvasRoot({ workspaceId = null, modeId = null, projectionSlots = null }) {
    const hostRef = useRef(null);
    const [hostRect, setHostRect] = useState(null);
    const [dismissedFirstExpressionNodeId, setDismissedFirstExpressionNodeId] = useState(null);
    const [contextMenu, setContextMenu] = useState({
        open: false,
        x: 0,
        y: 0,
        nodeId: null,
        actionIds: [],
        canGroup: false,
        canUngroup: false,
        canAttachMotion: false,
        canRemoveMotion: false,
    });
    const [debugVisible, setDebugVisible] = useState(false);
    const [debugCursor, setDebugCursor] = useState(null);
    const dispatcher = useDispatcher();

    const viewState = useWorkspaceViewState((state) => state) ?? {};
    const activeModeId = modeId ?? viewState.modeId ?? viewState.id ?? workspaceId ?? 'uiux';
    const viewport = viewState.viewport ?? { x: 0, y: 0, scale: 1 };
    const canvasSurface = viewState.canvasSurface ?? { type: 'smooth', snap: false };
    const nodesById = useWorkspaceVisualState((state) => state?.nodes ?? {});
    const runtimeDrag = useWorkspaceProjectionState((state) => state?.interaction?.drag ?? null);
    const document = useWorkspaceProjectionState((state) => state?.document ?? null);
    const selection = useWorkspaceVisualState((state) => state?.selection ?? { ids: [], primary: null, count: 0 });
    const nodeCount = useWorkspaceVisualState((state) => Object.keys(state?.nodes ?? {}).length);
    const selectedNode = selection?.primary ? nodesById?.[selection.primary] ?? null : null;
    const worldHistory = useWorkspaceProjectionState((state) => state?.document?.world?.history ?? null);
    const projectHasHistory = useMemo(
        () => hasProjectHistory({ workspaceId, nodeCount, worldHistory }),
        [workspaceId, nodeCount, worldHistory],
    );
    const firstRememberedArtifact = useMemo(
        () => resolveFirstRememberedArtifact({ workspaceId, worldHistory }),
        [workspaceId, worldHistory],
    );

    const zoomTier = getZoomTier(viewport.scale ?? 1);
    const projectHome = useMemo(
        () => resolveProjectHome({ workspaceId }),
        [workspaceId],
    );
    const currentFocus = useMemo(
        () =>
            resolveCurrentFocus({
                workspaceId,
                viewport,
                hostRect,
                fallback: projectHome,
            }),
        [hostRect, projectHome, viewport, workspaceId],
    );
    const debugBounds = useMemo(() => {
        if (!hostRect) return null;

        return {
            minX: viewport.x,
            minY: viewport.y,
            maxX: viewport.x + hostRect.width / (viewport.scale || 1),
            maxY: viewport.y + hostRect.height / (viewport.scale || 1),
        };
    }, [hostRect, viewport]);
    const debugDrag = useMemo(() => {
        const primaryNodeId = runtimeDrag?.nodeIds?.[0] ?? null;
        const primaryNode = primaryNodeId ? nodesById?.[primaryNodeId] ?? null : null;
        const primaryLayout = primaryNode?.layout ?? null;

        return {
            active: runtimeDrag?.active === true,
            type: runtimeDrag?.type ?? null,
            startPointer: runtimeDrag?.startPointer ?? null,
            currentPointer: runtimeDrag?.currentPointer ?? null,
            delta:
                runtimeDrag?.startPointer && runtimeDrag?.currentPointer
                    ? {
                          dx: runtimeDrag.currentPointer.x - runtimeDrag.startPointer.x,
                          dy: runtimeDrag.currentPointer.y - runtimeDrag.startPointer.y,
                      }
                    : null,
            primaryNode:
                Number.isFinite(primaryLayout?.x) && Number.isFinite(primaryLayout?.y)
                    ? { x: primaryLayout.x, y: primaryLayout.y }
                    : null,
        };
    }, [nodesById, runtimeDrag]);

    const activeTool = useToolStore((s) => s.activeTool ?? 'select');
    const selectionIds = Array.isArray(selection?.ids) ? selection.ids : [];
    // --- world point resolver ---
    const getWorldPointFromEvent = useCallback((event) => resolveWorldPointFromEvent(event, hostRef.current, viewport), [viewport]);

    // --- interaction system ---
    const interactions = useCanvasInteractions({
        dispatcher,
        workspaceId,
        resolveFocusViewportForBounds: (bounds) =>
            resolveArtifactFocusViewport({
                bounds,
                hostRect,
                viewport,
            }),
        getActiveToolId: () => activeTool,
        getWorldPointFromEvent,
        getDefaultParentId: () => null,
        getNodeCount: () => nodeCount,
    });

    // --- surface switching ---
    const setCanvasSurface = useCallback(
        (surface) => {
            if (!surface) return;

            canvasBus.emit('intent.workspace.canvasSurface.set', {
                workspaceId,
                surface,
            });
        },
        [workspaceId],
    );

    // --- context ---
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

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;

        const updateHostRect = () => {
            const nextRect = host.getBoundingClientRect();
            setHostRect({
                width: nextRect.width,
                height: nextRect.height,
            });
        };

        updateHostRect();

        if (typeof ResizeObserver !== 'function') return undefined;

        const observer = new ResizeObserver(() => {
            updateHostRect();
        });
        observer.observe(host);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const handleKeyDown = (event) => {
            if (!event.shiftKey || String(event.key).toLowerCase() !== 'd') return;
            event.preventDefault();
            setDebugVisible((current) => !current);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;

        host.dataset.projectHomeX = String(projectHome.x);
        host.dataset.projectHomeY = String(projectHome.y);
        host.dataset.projectFocusX = String(Number(currentFocus.x.toFixed(2)));
        host.dataset.projectFocusY = String(Number(currentFocus.y.toFixed(2)));
        host.dataset.projectFocusState =
            currentFocus.x === projectHome.x && currentFocus.y === projectHome.y ? 'home' : 'custom';
        host.dataset.projectHistoryState = projectHasHistory ? 'worked' : 'empty';
        host.dataset.projectFirstRememberedArtifactId = firstRememberedArtifact?.nodeId ?? '';
    }, [currentFocus, firstRememberedArtifact, projectHasHistory, projectHome]);

    useEffect(() => {
        if (
            !shouldInitializeProjectHomeViewport({
                workspaceId,
                viewport,
                hostRect,
                nodeCount,
                worldHistory,
            })
        ) {
            return;
        }

        const nextViewport = resolveProjectHomeViewport({
            workspaceId,
            hostRect,
            scale: viewport?.scale ?? 1,
            home: projectHome,
            viewport,
        });

        if (!nextViewport) return;

        if (typeof dispatcher?.dispatch !== 'function') return;

        dispatcher.dispatch({
            type: EventTypes.WORKSPACE_SET_VIEWPORT,
            payload: nextViewport,
        });
    }, [dispatcher, hostRect, nodeCount, projectHome, viewport, workspaceId, worldHistory]);

    useEffect(() => {
        if (!contextMenu.open) return;

        if (!contextMenu.nodeId) {
            setContextMenu((current) => ({ ...current, open: false }));
            return;
        }

        if (nodesById?.[contextMenu.nodeId]) return;

        setContextMenu((current) => ({ ...current, open: false, nodeId: null }));
    }, [contextMenu.nodeId, contextMenu.open, nodesById]);

    useEffect(() => {
        if (!dismissedFirstExpressionNodeId) return;
        if (selectedNode?.id === dismissedFirstExpressionNodeId) return;
        setDismissedFirstExpressionNodeId(null);
    }, [dismissedFirstExpressionNodeId, selectedNode?.id]);

    const closeContextMenu = useCallback((_reason = 'unknown') => {
        setContextMenu((current) => ({ ...current, open: false, nodeId: null }));
    }, []);

    const handlePointerMove = useCallback(
        (event) => {
            interactions.onPointerMove(event);
            setDebugCursor(getWorldPointFromEvent(event));
        },
        [getWorldPointFromEvent, interactions],
    );

    const handlePointerUp = useCallback(
        (event) => {
            interactions.onPointerUp(event);
            setDebugCursor(getWorldPointFromEvent(event));
        },
        [getWorldPointFromEvent, interactions],
    );

    const handlePointerCancel = useCallback(
        (event) => {
            interactions.onPointerCancel(event);
            setDebugCursor(null);
        },
        [interactions],
    );

    const handleContextMenu = useCallback(
        (event) => {
            event.preventDefault();

            if (typeof dispatcher?.dispatch === 'function') {
                dispatcher.dispatch({ type: EventTypes.DRAG_END });
            }

            const host = hostRef.current;
            if (!host) return;

            const rawTargetNodeId = resolveTargetNodeId(event.target, {
                x: event.clientX,
                y: event.clientY,
            });
            const fallbackSelectionNodeId =
                selectionIds.length > 0
                    ? selection?.primary ?? selectionIds[0] ?? null
                    : null;
            const resolvedTargetNodeId = rawTargetNodeId ?? fallbackSelectionNodeId;
            const targetNodeId = resolveSelectableGroupTarget(nodesById, resolvedTargetNodeId);

            if (!targetNodeId) {
                closeContextMenu();
                return;
            }

            const model = resolveSelectionContextMenuModel({
                targetNodeId,
                selectionIds,
                nodesById,
                hasMotionForNode: getMotionClipsForNode(document, targetNodeId).length > 0,
            });

            if (!model.shouldOpen) {
                closeContextMenu();
                return;
            }

            if (!selectionIds.includes(targetNodeId)) {
                canvasBus.emit('intent.selection.select', { nodeId: targetNodeId });
            }

            const rect = host.getBoundingClientRect();
            const actionCount =
                1 +
                (model.canGroup ? 1 : 0) +
                (model.canUngroup ? 1 : 0) +
                (model.canAttachMotion ? 1 : 0) +
                (model.canRemoveMotion ? 1 : 0);
            const position = clampContextMenuPosition({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
                rect,
                actionCount,
                reserveRight: true,
                reserveBottom: true,
            });

            setContextMenu({
                open: true,
                x: position.x,
                y: position.y,
                nodeId: model.nodeId,
                actionIds: model.actionIds,
                canGroup: model.canGroup,
                canUngroup: model.canUngroup,
                canAttachMotion: model.canAttachMotion,
                canRemoveMotion: model.canRemoveMotion,
            });
        },
        [closeContextMenu, dispatcher, document, nodesById, selectionIds],
    );

    const handleDeleteSelection = useCallback(() => {
        if (typeof dispatcher?.dispatch !== 'function') return;

        dispatchNodeDeleteSelection({
            ids: contextMenu.actionIds,
            dispatchEvent: dispatcher.dispatch,
        });
    }, [contextMenu.actionIds, dispatcher]);

    const handleAttachMotion = useCallback(() => {
        const nodeId = contextMenu.actionIds[0] ?? null;
        attachMotionClipToNode(dispatcher?.dispatch, nodeId);
    }, [contextMenu.actionIds, dispatcher]);

    const handleRemoveMotion = useCallback(() => {
        const nodeId = contextMenu.actionIds[0] ?? null;
        if (!nodeId) return;
        removeMotionClipsFromNode(dispatcher?.dispatch, nodeId, getMotionClipsForNode(document, nodeId));
    }, [contextMenu.actionIds, dispatcher, document]);
    const emptyWorldProjection =
        typeof projectionSlots?.emptyWorld === 'function'
            ? projectionSlots.emptyWorld({
                  workspaceId,
                  modeId: activeModeId,
                  nodeCount,
                  worldHistory,
              })
            : projectionSlots?.emptyWorld ?? null;
    const firstExpressionProjection =
        typeof projectionSlots?.firstExpression === 'function'
            ? projectionSlots.firstExpression({
                  workspaceId,
                  modeId: activeModeId,
                  nodeCount,
                  selectedNode,
                  dismissedNodeId: dismissedFirstExpressionNodeId,
                  onDismiss: setDismissedFirstExpressionNodeId,
              })
            : projectionSlots?.firstExpression ?? null;

    return (
        <CanvasProvider value={contextValue}>
            <CanvasHost
                ref={hostRef}
                viewport={viewport}
                worldOffset={{ x: 0, y: 0 }}
                cameraTransform={null}
                background={<CanvasSurface surface={canvasSurface} viewport={viewport} />}
                overlayPointerEvents='auto'
                overlay={
                    <>
                        <SelectionContextMenu
                            open={contextMenu.open}
                            x={contextMenu.x}
                            y={contextMenu.y}
                            canGroup={contextMenu.canGroup}
                            canUngroup={contextMenu.canUngroup}
                            canAttachMotion={contextMenu.canAttachMotion}
                            canRemoveMotion={contextMenu.canRemoveMotion}
                            onDelete={handleDeleteSelection}
                            onGroup={() =>
                                runCommandIntent('group', { nodeIds: contextMenu.actionIds }, { dispatcher, workspaceId, modeId: activeModeId })
                            }
                            onUngroup={() =>
                                runCommandIntent('ungroup', { nodeIds: contextMenu.actionIds }, { dispatcher, workspaceId, modeId: activeModeId })
                            }
                            onAttachMotion={handleAttachMotion}
                            onRemoveMotion={handleRemoveMotion}
                            onClose={closeContextMenu}
                        />
                        {debugVisible && debugBounds ? (
                            <CanvasDebugOverlay
                                viewport={viewport}
                                bounds={debugBounds}
                                cursor={debugCursor}
                                zoomTier={zoomTier}
                                drag={debugDrag}
                                onToggle={() => setDebugVisible(false)}
                            />
                        ) : null}
                        {emptyWorldProjection}
                        {firstExpressionProjection}
                        <GraphicVocabularyOverlay
                            workspaceId={workspaceId}
                            modeId={activeModeId}
                            selectedNode={selectedNode}
                            nodesById={nodesById}
                            firstExpressionDismissedNodeId={dismissedFirstExpressionNodeId}
                        />
                        <GraphicRefinementOverlay
                            workspaceId={workspaceId}
                            modeId={activeModeId}
                            selectedNode={selectedNode}
                            nodesById={nodesById}
                        />
                        <GraphicDeliveryOverlay
                            workspaceId={workspaceId}
                            modeId={activeModeId}
                            selectedNode={selectedNode}
                            nodesById={nodesById}
                        />
                    </>
                }
                onPointerDown={interactions.onPointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onContextMenu={handleContextMenu}>
                {/* === STAGE === */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        overflow: 'visible',
                    }}>
                    <HomeLandmark
                        workspaceId={workspaceId}
                        viewport={viewport}
                        nodeCount={nodeCount}
                        worldHistory={worldHistory}
                    />
                    <FirstFrameAffordance
                        workspaceId={workspaceId}
                        viewport={viewport}
                        activeTool={activeTool}
                        nodeCount={nodeCount}
                        worldHistory={worldHistory}
                    />
                    <WorldOriginMarker workspaceId={workspaceId} viewport={viewport} />

                    {/* --- Content layer --- */}
                    <NodeLayer />

                    {/* --- Interaction overlays --- */}
                    <CanvasGhostLayer />
                    <GuideLayer />
                    <SelectionLayer />
                </div>
            </CanvasHost>
        </CanvasProvider>
    );
}

export { useCanvasInteractions } from '@/ui/interactions/useCanvasInteractions.js';
