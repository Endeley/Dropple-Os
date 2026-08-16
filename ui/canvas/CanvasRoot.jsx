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
import { NodeMutationTypes } from '@/core/events/nodeMutationTypes.js';
import { INTENTS } from '@/core/intents/intentTypes.js';
import { getZoomTier } from '@/runtime/canvas/zoomTiers.js';
import { RuntimeDispatchRelay } from '@/runtime/boundary/RuntimeDispatchRelay.jsx';
import {
    useWorkspaceProjectionState,
    useWorkspaceViewState,
    useWorkspaceVisualState,
} from '@/runtime/projection';
import { useToolStore } from '@/ui/state/useToolStore.js';
import { resolveTargetNodeId } from '@/ui/interactions/resolveTargetNodeId.js';
import { resolveSelectableGroupTarget } from '@/runtime/grouping/resolveSelectableGroupTarget.js';
import { runCommandIntent } from '@/ui/bridges/runtimeCommandFacade.js';
import { emitLayoutUpdate } from '@/runtime/events/emitLayoutUpdate.js';
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
const EMPTY_MAP = Object.freeze({});
const EMPTY_SELECTION = Object.freeze({ ids: [], primary: null, count: 0 });
const DEFAULT_VIEWPORT = Object.freeze({ x: 0, y: 0, scale: 1 });
const DEFAULT_CANVAS_SURFACE = Object.freeze({ type: 'smooth', snap: false });

function InlineTextEditor({
    node,
    value,
    onChange,
    onCommit,
    onCancel,
}) {
    const editorRef = useRef(null);

    useEffect(() => {
        const element = editorRef.current;
        if (!element) return;

        element.focus();
        const length = element.value?.length ?? 0;
        element.setSelectionRange?.(length, length);
    }, [node?.id]);

    if (!node?.layout) return null;

    const layout = node.layout ?? {};
    if (
        !Number.isFinite(layout.x) ||
        !Number.isFinite(layout.y) ||
        !Number.isFinite(layout.width) ||
        !Number.isFinite(layout.height)
    ) {
        return null;
    }

    const contentProps = node.props?.content ?? {};
    const textSizingMode = contentProps.sizingMode === 'auto-width' ? 'auto-width' : 'fixed-width';
    const textAlign = contentProps.align ?? 'left';
    const textWrap =
        textSizingMode === 'auto-width'
            ? 'nowrap'
            : (contentProps.wrap === false ? 'nowrap' : 'wrap');
    const style = node.style ?? {};
    const fontSize = Number.isFinite(style.fontSize) ? style.fontSize : 16;
    const fontWeight = Number.isFinite(style.fontWeight) ? style.fontWeight : 400;
    const lineHeight = Number.isFinite(style.lineHeight) ? style.lineHeight : 1.4;
    const letterSpacing = Number.isFinite(style.letterSpacing) ? style.letterSpacing : 0;
    const fontStyle =
        style.fontStyle === 'italic' || style.fontStyle === 'oblique' ? style.fontStyle : 'normal';
    const fontFamily =
        typeof style.fontFamily === 'string' && style.fontFamily.trim().length > 0
            ? style.fontFamily
            : 'sans-serif';
    const textDecorationLine =
        typeof style.textDecorationLine === 'string' && style.textDecorationLine.trim().length > 0
            ? style.textDecorationLine
            : 'none';
    const textTransform =
        typeof style.textTransform === 'string' && style.textTransform.trim().length > 0
            ? style.textTransform
            : 'none';
    const fills = Array.isArray(style.fills) ? style.fills : [];
    const textColor =
        fills.find((entry) => entry?.enabled !== false)?.color ??
        style.fill ??
        '#111827';

    return (
        <textarea
            ref={editorRef}
            data-testid='inline-text-editor'
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={(event) => onCommit(event.target.value)}
            onPointerDown={(event) => event.stopPropagation()}
            onDoubleClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
                event.stopPropagation();

                if (event.key === 'Escape') {
                    event.preventDefault();
                    onCancel();
                    return;
                }

                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                    event.preventDefault();
                    onCommit(event.currentTarget.value);
                }
            }}
            spellCheck={false}
            style={{
                position: 'absolute',
                left: layout.x,
                top: layout.y,
                width: layout.width,
                height: layout.height,
                margin: 0,
                padding: 0,
                border: '1px solid rgba(99, 102, 241, 0.9)',
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.92)',
                color: textColor,
                fontFamily,
                fontSize,
                fontWeight,
                fontStyle,
                lineHeight,
                letterSpacing,
                textAlign,
                textDecorationLine,
                textTransform,
                resize: 'none',
                whiteSpace: textWrap === 'nowrap' ? 'pre' : 'pre-wrap',
                wordBreak: textWrap === 'nowrap' ? 'normal' : 'break-word',
                overflow: 'hidden',
                outline: 'none',
                boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.18)',
                boxSizing: 'border-box',
                transform: `rotate(${layout.rotation ?? 0}deg)`,
                transformOrigin: 'center',
                zIndex: (node.zIndex ?? 0) + 1000,
            }}
        />
    );
}

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

export default function CanvasRoot({
    workspaceId = null,
    modeId = null,
    projectionSlots = null,
    resolveDefaultCreateParentId = null,
    dismissedFirstExpressionNodeId = null,
    onDismissFirstExpression = null,
    immersiveFirstExpression = false,
}) {
    return (
        <RuntimeDispatchRelay>
            {(dispatcher) => (
                <CanvasRootContent
                    dispatcher={dispatcher}
                    workspaceId={workspaceId}
                    modeId={modeId}
                    projectionSlots={projectionSlots}
                    resolveDefaultCreateParentId={resolveDefaultCreateParentId}
                    dismissedFirstExpressionNodeId={dismissedFirstExpressionNodeId}
                    onDismissFirstExpression={onDismissFirstExpression}
                    immersiveFirstExpression={immersiveFirstExpression}
                />
            )}
        </RuntimeDispatchRelay>
    );
}

function CanvasRootContent({
    workspaceId = null,
    modeId = null,
    projectionSlots = null,
    dispatcher = null,
    resolveDefaultCreateParentId = null,
    dismissedFirstExpressionNodeId = null,
    onDismissFirstExpression = null,
    immersiveFirstExpression = false,
}) {
    const hostRef = useRef(null);
    const inlineTextDraftRef = useRef('');
    const inlineTextSessionRef = useRef(null);
    const historyViewportInitializedRef = useRef(false);
    const [hostRect, setHostRect] = useState(null);
    const [internalDismissedFirstExpressionNodeId, setInternalDismissedFirstExpressionNodeId] = useState(null);
    const [inlineTextSession, setInlineTextSession] = useState(null);
    const [pendingInlineTextEntry, setPendingInlineTextEntry] = useState(null);
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
    const dispatchEvent = dispatcher?.dispatch ?? null;

    const viewState = useWorkspaceViewState((state) => state) ?? EMPTY_MAP;
    const activeModeId = modeId ?? viewState.modeId ?? viewState.id ?? workspaceId ?? 'uiux';
    const viewport = viewState.viewport ?? DEFAULT_VIEWPORT;
    const canvasSurface = viewState.canvasSurface ?? DEFAULT_CANVAS_SURFACE;
    const nodesById = useWorkspaceVisualState((state) => state?.nodes ?? EMPTY_MAP);
    const documentNodesById =
        useWorkspaceProjectionState((state) => state?.document?.sceneGraph?.nodes ?? state?.nodes ?? EMPTY_MAP) ?? EMPTY_MAP;
    const runtimeSelection = useWorkspaceProjectionState((state) => state?.selection ?? null);
    const runtimeDrag = useWorkspaceProjectionState((state) => state?.interaction?.drag ?? null);
    const document = useWorkspaceProjectionState((state) => state?.document ?? null);
    const selection = useWorkspaceVisualState((state) => state?.selection ?? EMPTY_SELECTION);
    const nodeCount = useWorkspaceVisualState((state) => Object.keys(state?.nodes ?? {}).length);
    const selectedNode = selection?.primary
        ? nodesById?.[selection.primary] ?? documentNodesById?.[selection.primary] ?? null
        : null;
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
    const resolvedDismissedFirstExpressionNodeId =
        dismissedFirstExpressionNodeId ?? internalDismissedFirstExpressionNodeId;
    const handleDismissFirstExpression = useCallback(
        (nodeId) => {
            if (typeof onDismissFirstExpression === 'function') {
                onDismissFirstExpression(nodeId);
                return;
            }
            setInternalDismissedFirstExpressionNodeId(nodeId);
        },
        [onDismissFirstExpression],
    );
    const selectionIds = useMemo(
        () => (Array.isArray(selection?.ids) ? selection.ids : []),
        [selection?.ids],
    );
    const textNodes = useMemo(
        () => Object.values(nodesById ?? {}).filter((node) => node?.type === 'text'),
        [nodesById],
    );
    // --- world point resolver ---
    const getWorldPointFromEvent = useCallback((event) => resolveWorldPointFromEvent(event, hostRef.current, viewport), [viewport]);
    const getDefaultCreateParentId = useCallback(() => {
        if (typeof resolveDefaultCreateParentId !== 'function') return null;
        return (
            resolveDefaultCreateParentId({
                activeToolId: activeTool,
                selectedNode,
                nodesById,
                workspaceId,
                modeId: activeModeId,
            }) ?? null
        );
    }, [activeModeId, activeTool, nodesById, resolveDefaultCreateParentId, selectedNode, workspaceId]);
    const resolveTextNodeAtWorldPoint = useCallback(
        (point) => {
            if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
                return null;
            }

            const projectedNodes = Object.values(nodesById ?? {});
            const candidates = projectedNodes
                .filter((node) => {
                    if (node?.type !== 'text') return false;
                    const layout =
                        node?.layout ??
                        (node?.id ? document?.layout?.nodes?.[node.id] : null) ??
                        null;
                    if (
                        !Number.isFinite(layout?.x) ||
                        !Number.isFinite(layout?.y) ||
                        !Number.isFinite(layout?.width) ||
                        !Number.isFinite(layout?.height)
                    ) {
                        return false;
                    }

                    return (
                        point.x >= layout.x &&
                        point.x <= layout.x + layout.width &&
                        point.y >= layout.y &&
                        point.y <= layout.y + layout.height
                    );
                })
                .sort((left, right) => {
                    const zDelta = (left?.zIndex ?? 0) - (right?.zIndex ?? 0);
                    if (zDelta !== 0) return zDelta;
                    return String(left?.id ?? '').localeCompare(String(right?.id ?? ''));
                });

            return candidates[candidates.length - 1] ?? null;
        },
        [document?.layout?.nodes, nodesById],
    );

    const beginInlineTextEditing = useCallback(
        (node, source = 'manual') => {
            if (!node || node.type !== 'text') return;

            const initialContent = typeof node.content === 'string' ? node.content : '';
            inlineTextDraftRef.current = initialContent;
            const nextSession = {
                nodeId: node.id,
                draft: initialContent,
                initialContent,
                source,
            };
            inlineTextSessionRef.current = nextSession;
            setInlineTextSession(nextSession);
        },
        [],
    );

    const closeInlineTextSession = useCallback(() => {
        inlineTextDraftRef.current = '';
        inlineTextSessionRef.current = null;
        setPendingInlineTextEntry(null);
        setInlineTextSession(null);
    }, []);

    const commitInlineTextEditing = useCallback(
        (nextValue = null) => {
            const session = inlineTextSessionRef.current;
            if (!session) return;

            const content =
                typeof nextValue === 'string'
                    ? nextValue
                    : typeof inlineTextDraftRef.current === 'string'
                      ? inlineTextDraftRef.current
                      : session.draft;

            if (content !== session.initialContent && typeof dispatchEvent === 'function') {
                dispatchEvent({
                    type: NodeMutationTypes.CONTENT_UPDATE,
                    payload: {
                        nodeId: session.nodeId,
                        content,
                    },
                });
            }

            if (session.source === 'create') {
                canvasBus.emit(INTENTS.TOOL_SET_ACTIVE, {
                    toolId: 'select',
                    workspaceId: activeModeId,
                });
            }

            closeInlineTextSession();
        },
        [activeModeId, closeInlineTextSession, dispatchEvent],
    );

    const cancelInlineTextEditing = useCallback(() => {
        closeInlineTextSession();
    }, [closeInlineTextSession]);

    const handleCreateCommitted = useCallback(
        ({ nodeId, nodeType }) => {
            if (nodeType !== 'text' || !nodeId) return;

            setPendingInlineTextEntry({
                nodeId,
                source: 'create',
            });

            canvasBus.emit(INTENTS.TOOL_SET_ACTIVE, {
                toolId: 'select',
                workspaceId: activeModeId,
            });
        },
        [activeModeId],
    );

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
        getDefaultParentId: getDefaultCreateParentId,
        getNodeCount: () => nodeCount,
        onCreateCommitted: handleCreateCommitted,
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
            immersiveFirstExpression,

            onResizeHandlePointerDown: interactions.onResizeHandlePointerDown,
            onResizeHandlePointerMove: interactions.onResizeHandlePointerMove,
            onResizeHandlePointerUp: interactions.onResizeHandlePointerUp,
            onRotateHandlePointerDown: interactions.onRotateHandlePointerDown,
        }),
        [immersiveFirstExpression, interactions, setCanvasSurface, zoomTier],
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
        if (dismissedFirstExpressionNodeId != null) return;
        if (!internalDismissedFirstExpressionNodeId) return;
        if (!selectedNode?.id) return;
        if (selectedNode?.id === internalDismissedFirstExpressionNodeId) return;
        setInternalDismissedFirstExpressionNodeId(null);
    }, [dismissedFirstExpressionNodeId, internalDismissedFirstExpressionNodeId, selectedNode?.id]);

    useEffect(() => {
        inlineTextSessionRef.current = inlineTextSession;
    }, [inlineTextSession]);

    useEffect(() => {
        const pendingNodeId = pendingInlineTextEntry?.nodeId ?? null;
        const pendingSource = pendingInlineTextEntry?.source ?? 'manual';
        if (!pendingNodeId) return;
        if (runtimeSelection?.primary !== pendingNodeId) return;
        if (inlineTextSession?.nodeId === pendingNodeId) return;

        const createdTextNode =
            documentNodesById?.[pendingNodeId] ??
            nodesById?.[pendingNodeId] ??
            null;
        if (!createdTextNode || createdTextNode.type !== 'text') return;

        setPendingInlineTextEntry(null);
        beginInlineTextEditing(createdTextNode, pendingSource);
    }, [
        beginInlineTextEditing,
        documentNodesById,
        inlineTextSession?.nodeId,
        nodesById,
        pendingInlineTextEntry,
        runtimeSelection?.primary,
    ]);

    useEffect(() => {
        if (!inlineTextSession?.nodeId) return;
        if (runtimeSelection?.primary === inlineTextSession.nodeId) return;
        commitInlineTextEditing();
    }, [commitInlineTextEditing, inlineTextSession?.nodeId, runtimeSelection?.primary]);

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

        if (typeof dispatchEvent !== 'function') return;

        dispatchEvent({
            type: EventTypes.WORKSPACE_SET_VIEWPORT,
            payload: nextViewport,
        });
    }, [dispatchEvent, hostRect, nodeCount, projectHome, viewport, workspaceId, worldHistory]);

    useEffect(() => {
        if (historyViewportInitializedRef.current) return;
        if (!projectHasHistory) return;
        if (!firstRememberedArtifact?.layout) return;
        if (!hostRect) return;
        if (typeof dispatchEvent !== 'function') return;

        const currentX = Number.isFinite(viewport?.x) ? viewport.x : 0;
        const currentY = Number.isFinite(viewport?.y) ? viewport.y : 0;
        const currentScale = Number.isFinite(viewport?.scale) ? viewport.scale : 1;

        if (currentX !== 0 || currentY !== 0 || currentScale !== 1) {
            historyViewportInitializedRef.current = true;
            return;
        }

        const nextViewport = resolveArtifactFocusViewport({
            bounds: firstRememberedArtifact.layout,
            hostRect,
            viewport,
        });
        if (!nextViewport) return;

        historyViewportInitializedRef.current = true;
        dispatchEvent({
            type: EventTypes.WORKSPACE_SET_VIEWPORT,
            payload: nextViewport,
        });
    }, [dispatchEvent, firstRememberedArtifact?.layout, hostRect, projectHasHistory, viewport]);

    useEffect(() => {
        if (typeof window === 'undefined' || !hostRef.current || !dispatcher || textNodes.length === 0) {
            return undefined;
        }

        let cancelled = false;
        const frame = window.requestAnimationFrame(() => {
            if (cancelled || !hostRef.current) return;

            const updates = [];

            textNodes.forEach((node) => {
                const contentProps = node?.props?.content ?? {};
                const sizingMode = contentProps.sizingMode === 'auto-width' ? 'auto-width' : 'fixed-width';
                const textElement = hostRef.current.querySelector(
                    `[data-pointer-role="node"][data-node-id="${node.id}"] [data-testid="text-node-content"]`,
                );
                if (!(textElement instanceof HTMLElement)) return;

                const currentLayout = node.layout ?? {};
                const measuredWidth = Math.max(1, Math.ceil(textElement.scrollWidth));
                const measuredHeight = Math.max(1, Math.ceil(textElement.scrollHeight));

                const nextWidth = sizingMode === 'auto-width' ? measuredWidth : currentLayout.width;
                const nextHeight = measuredHeight;

                const widthChanged =
                    Number.isFinite(nextWidth) &&
                    Math.abs((currentLayout.width ?? 0) - nextWidth) >= 1;
                const heightChanged =
                    Number.isFinite(nextHeight) &&
                    Math.abs((currentLayout.height ?? 0) - nextHeight) >= 1;

                if (!widthChanged && !heightChanged) return;

                updates.push({
                    nodeId: node.id,
                    width: widthChanged ? nextWidth : currentLayout.width,
                    height: heightChanged ? nextHeight : currentLayout.height,
                });
            });

            if (updates.length > 0) {
                emitLayoutUpdate(dispatcher, updates);
            }
        });

        return () => {
            cancelled = true;
            window.cancelAnimationFrame(frame);
        };
    }, [dispatcher, textNodes]);

    useEffect(() => {
        if (!contextMenu.open) return;

        if (!contextMenu.nodeId) {
            setContextMenu((current) => ({ ...current, open: false }));
            return;
        }

        if (nodesById?.[contextMenu.nodeId]) return;

        setContextMenu((current) => ({ ...current, open: false, nodeId: null }));
    }, [contextMenu.nodeId, contextMenu.open, nodesById]);

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

            if (typeof dispatchEvent === 'function') {
                dispatchEvent({ type: EventTypes.DRAG_END });
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
        [closeContextMenu, dispatchEvent, document, nodesById, selection?.primary, selectionIds],
    );

    const handleDeleteSelection = useCallback(() => {
        if (typeof dispatchEvent !== 'function') return;

        dispatchNodeDeleteSelection({
            ids: contextMenu.actionIds,
            dispatchEvent,
        });
    }, [contextMenu.actionIds, dispatchEvent]);

    const handleAttachMotion = useCallback(() => {
        const nodeId = contextMenu.actionIds[0] ?? null;
        attachMotionClipToNode(dispatchEvent, nodeId);
    }, [contextMenu.actionIds, dispatchEvent]);

    const handleRemoveMotion = useCallback(() => {
        const nodeId = contextMenu.actionIds[0] ?? null;
        if (!nodeId) return;
        removeMotionClipsFromNode(dispatchEvent, nodeId, getMotionClipsForNode(document, nodeId));
    }, [contextMenu.actionIds, dispatchEvent, document]);

    const requestInlineTextEditingFromGesture = useCallback(
        (event) => {
            if (inlineTextSessionRef.current) return;

            const rawTargetNodeId = resolveTargetNodeId(event.target, {
                x: event.clientX,
                y: event.clientY,
            });
            const resolvedNodesById = documentNodesById ?? nodesById;
            const targetNodeId = resolveSelectableGroupTarget(resolvedNodesById, rawTargetNodeId);
            let targetNode = targetNodeId
                ? documentNodesById?.[targetNodeId] ?? nodesById?.[targetNodeId] ?? null
                : null;

            if (!targetNode || targetNode.type !== 'text') {
                const fallbackTextNode = resolveTextNodeAtWorldPoint(
                    resolveWorldPointFromEvent(event, hostRef.current, viewport),
                );
                if (!fallbackTextNode) return;
                targetNode = fallbackTextNode;
            }

            if (typeof dispatchEvent === 'function') {
                dispatchEvent({
                    type: EventTypes.SELECTION_SET,
                    payload: {
                        ids: [targetNode.id],
                        primary: targetNode.id,
                    },
                });
            }

            setPendingInlineTextEntry({
                nodeId: targetNode.id,
                source: 'manual',
            });
            event.preventDefault();
            event.stopPropagation();
        },
        [dispatchEvent, documentNodesById, nodesById, resolveTextNodeAtWorldPoint, viewport],
    );
    const inlineTextNode =
        inlineTextSession?.nodeId
            ? nodesById?.[inlineTextSession.nodeId] ?? documentNodesById?.[inlineTextSession.nodeId] ?? null
            : null;

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
                  nodesById,
                  selectedNode,
                  dismissedNodeId: resolvedDismissedFirstExpressionNodeId,
                  onDismiss: handleDismissFirstExpression,
              })
            : projectionSlots?.firstExpression ?? null;
    const projectEmergenceProjection =
        typeof projectionSlots?.projectEmergence === 'function'
            ? projectionSlots.projectEmergence({
                  workspaceId,
                  modeId: activeModeId,
                  nodeCount,
                  nodesById,
                  selectedNode,
              })
            : projectionSlots?.projectEmergence ?? null;

    return (
        <CanvasProvider value={contextValue}>
            <CanvasHost
                ref={hostRef}
                viewport={viewport}
                worldOffset={{ x: 0, y: 0 }}
                cameraTransform={null}
                background={<CanvasSurface surface={canvasSurface} viewport={viewport} />}
                overlayPointerEvents='none'
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
                        {projectEmergenceProjection}
                        <GraphicVocabularyOverlay
                            workspaceId={workspaceId}
                            modeId={activeModeId}
                            selectedNode={selectedNode}
                            nodesById={nodesById}
                            firstExpressionDismissedNodeId={resolvedDismissedFirstExpressionNodeId}
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
                onContextMenu={handleContextMenu}
                onDoubleClick={requestInlineTextEditingFromGesture}>
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

                    {inlineTextNode && inlineTextSession ? (
                        <InlineTextEditor
                            node={inlineTextNode}
                            value={inlineTextSession.draft}
                            onChange={(draft) => {
                                inlineTextDraftRef.current = draft;
                                setInlineTextSession((current) =>
                                    current ? { ...current, draft } : current
                                );
                            }}
                            onCommit={commitInlineTextEditing}
                            onCancel={cancelInlineTextEditing}
                        />
                    ) : null}

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
