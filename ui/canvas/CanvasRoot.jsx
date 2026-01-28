'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import CanvasHost from './CanvasHost.jsx';
import NodeLayer from './NodeLayer.jsx';
import GhostLayer from './GhostLayer.jsx';
import GuideLayer from './GuideLayer.jsx';
import SelectionLayer from './SelectionLayer.jsx';
import RemoteCursors from './RemoteCursors.jsx';
import RemoteSelections from './RemoteSelections.jsx';
import { resolveWorkspacePolicy } from '@/workspaces/registry/resolveWorkspacePolicy.js';
import { getRuntimeState } from '@/runtime/state/runtimeState.js';
import TimelinePanel from '@/ui/timeline/TimelinePanel.jsx';
import { perfStart, perfEnd } from '@/perf/perfTracker.js';
import { useWorkspaceState } from '@/runtime/state/useWorkspaceState.js';
import { CanvasSurface } from '@/ui/canvas/surface/CanvasSurface.jsx';
import { CanvasOriginMarker } from '@/ui/canvas/CanvasOriginMarker.jsx';
import { useAnimatedRuntimeStore } from '@/runtime/stores/useAnimatedRuntimeStore.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useSelectionStore } from '@/selection/useSelectionStore.js';
import { screenToWorld } from '@/canvas/transform/screenToWorld.js';
import { getViewportBounds } from '@/canvas/viewport/getViewportBounds.js';
import { setViewport } from '@/runtime/state/workspaceState.js';
import { CanvasDebugOverlay } from '@/ui/canvas/CanvasDebugOverlay.jsx';
import { getZoomTier } from '@/ui/canvas/zoomTiers.js';
import { CanvasProvider } from '@/ui/canvas/CanvasContext.jsx';
import { CanvasNearestDebugOverlay } from '@/ui/canvas/CanvasNearestDebugOverlay.jsx';
import { useWorldPersistence } from '@/ui/canvas/useWorldPersistence.js';
import { useNearestWorldObjects } from '@/ui/canvas/hooks/useNearestWorldObjects.js';
import { setNearestSnapshot } from '@/ui/canvas/hooks/nearestSnapshot.js';
import { Minimap } from '@/ui/canvas/Minimap.jsx';
import { canvasBus } from '@/ui/canvasBus.js';
import { getSnapRadius } from '@/ui/canvas/snap/snapConfig.js';
import { computeSnapCandidates } from '@/engine/constraints/snapEngine.js';
import { observeSpatialState } from '@/ui/canvas/intelligence/observeSpatialState.js';
import { mapObserverInsightsToSuggestions } from '@/ui/canvas/intelligence/suggestionLayer.js';
import { mergeValidationSuggestions } from '@/ui/canvas/intelligence/validationSuggestionBridge.js';
import { useSuggestionStore } from '@/ui/canvas/suggestions/suggestionStore.js';
import { SuggestionPanel } from '@/ui/canvas/SuggestionPanel.jsx';
import { validateUX } from '@/ui/canvas/validation/validateUX.js';
import { useValidationStore } from '@/ui/canvas/validation/validationStore.js';
import { ValidationPanel } from '@/ui/canvas/ValidationPanel.jsx';
import { ValidationOverlayLayer } from '@/ui/canvas/ValidationOverlayLayer.jsx';

export default function CanvasRoot({ workspaceId }) {
    perfStart('canvas.render');
    const workspace = resolveWorkspacePolicy(workspaceId);
    const designState = getRuntimeState();
    const viewport = useWorkspaceState((state) => state.viewport);
    const canvasSurface = useWorkspaceState((state) => state.canvasSurface);
    const canvasPolicy = useWorkspaceState((state) => state.canvasPolicy);
    const nodes = useAnimatedRuntimeStore((state) => state.nodes);
    const runtimeNodes = useRuntimeStore((state) => state.nodes);
    const setSelectedIds = useSelectionStore((state) => state.setSelectedIds);
    const clearSelection = useSelectionStore((state) => state.clearSelection);

    const containerRef = useRef(null);
    const panRef = useRef({
        active: false,
        startX: 0,
        startY: 0,
        originX: 0,
        originY: 0,
    });
    const selectionRef = useRef({
        active: false,
        start: null,
        current: null,
    });

    const [selectionRect, setSelectionRect] = useState(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [cursorWorld, setCursorWorld] = useState(null);
    const [debugEnabled, setDebugEnabled] = useState(false);
    const [suggestionsVisible, setSuggestionsVisible] = useState(false);
    const [validationVisible, setValidationVisible] = useState(false);
    const [interaction, setInteraction] = useState({
        isDragging: false,
        activeNodeId: null,
    });
    const observerFrameRef = useRef(null);
    const observerPayloadRef = useRef(null);
    const observerLatestRef = useRef(null);

    const allowPan = canvasPolicy?.allowPan ?? true;
    const allowZoom = canvasPolicy?.allowZoom ?? true;
    const minZoom = canvasPolicy?.minZoom ?? 0.05;
    const maxZoom = canvasPolicy?.maxZoom ?? 8;

    useWorldPersistence({
        workspaceId: workspace?.id ?? workspaceId,
        viewport,
        nodesById: runtimeNodes,
    });

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            setCanvasSize({
                width: entry.contentRect.width,
                height: entry.contentRect.height,
            });
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key.toLowerCase() !== 'd' || !e.shiftKey) return;
            setDebugEnabled((prev) => !prev);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;
        const onKeyDown = (e) => {
            const key = e.key.toLowerCase();
            if (key !== 's' || !e.shiftKey || !(e.metaKey || e.ctrlKey)) return;
            setSuggestionsVisible((prev) => !prev);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;
        if (workspace?.profile !== 'ux-validation') return;
        const onKeyDown = (e) => {
            const key = e.key.toLowerCase();
            if (key !== 'v' || !e.shiftKey || !(e.metaKey || e.ctrlKey)) return;
            setValidationVisible((prev) => !prev);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [workspace?.profile]);

    const zoomTier = useMemo(
        () => getZoomTier(viewport?.scale ?? 1),
        [viewport?.scale]
    );

    const nearest = useNearestWorldObjects({
        worldPoint: cursorWorld,
        enabled: true,
    });
    const setSuggestions = useSuggestionStore((state) => state.setSuggestions);
    const setValidationIssues = useValidationStore((state) => state.setIssues);

    useEffect(() => {
        setNearestSnapshot(nearest, cursorWorld);
    }, [nearest, cursorWorld]);

    const scheduleObserver = () => {
        if (process.env.NODE_ENV !== 'development') return;
        if (observerFrameRef.current) return;
        observerFrameRef.current = requestAnimationFrame(() => {
            observerFrameRef.current = null;
            const input = observerPayloadRef.current;
            if (!input) return;
            const frozenInput = deepFreeze(input);
            observerLatestRef.current = frozenInput;
            const insights = observeSpatialState(frozenInput);
            const frozenOutput = deepFreeze(insights);
            const baseSuggestions = mapObserverInsightsToSuggestions(frozenOutput, {
                isDragging: input.interaction?.isDragging ?? false,
            });
            const mergedSuggestions = mergeValidationSuggestions({
                validationIssues: useValidationStore.getState().issues ?? [],
                suggestions: baseSuggestions,
            });
            const frozenSuggestions = deepFreeze(mergedSuggestions);

            const previous = window.__droppleDebug;
            window.__droppleDebug = {
                ...(previous || {}),
                observerInsights: frozenOutput,
                suggestions: frozenSuggestions,
            };
            setSuggestions(frozenSuggestions);
            console.debug('[Observer]', frozenOutput);
            console.debug('[Suggestions]', frozenSuggestions);
        });
    };

    const flushObserver = () => {
        if (process.env.NODE_ENV !== 'development') return;
        if (observerFrameRef.current) {
            cancelAnimationFrame(observerFrameRef.current);
            observerFrameRef.current = null;
        }
        const input = observerPayloadRef.current || observerLatestRef.current;
        if (!input) return;
        const frozenInput = deepFreeze(input);
        observerLatestRef.current = frozenInput;
        const insights = observeSpatialState(frozenInput);
        const frozenOutput = deepFreeze(insights);
        const baseSuggestions = mapObserverInsightsToSuggestions(frozenOutput, {
            isDragging: input.interaction?.isDragging ?? false,
        });
        const mergedSuggestions = mergeValidationSuggestions({
            validationIssues: useValidationStore.getState().issues ?? [],
            suggestions: baseSuggestions,
        });
        const frozenSuggestions = deepFreeze(mergedSuggestions);

        const previous = window.__droppleDebug;
        window.__droppleDebug = {
            ...(previous || {}),
            observerInsights: frozenOutput,
            suggestions: frozenSuggestions,
        };
        setSuggestions(frozenSuggestions);
        console.debug('[Observer]', frozenOutput);
        console.debug('[Suggestions]', frozenSuggestions);
    };

    useEffect(() => {
        function onSessionStart(payload) {
            if (payload?.sessionType !== 'move') return;
            setInteraction((prev) => ({ ...prev, isDragging: true }));
            if (process.env.NODE_ENV === 'development') {
                flushObserver();
            }
        }

        function onSessionUpdate(payload) {
            if (payload?.sessionType !== 'move') return;
            const preview = payload?.preview;
            const nodeId = preview?.nodeIds?.[0] ?? null;
            setInteraction((prev) => ({
                ...prev,
                activeNodeId: nodeId ?? prev.activeNodeId,
            }));
        }

        function onSessionEnd(payload) {
            if (payload?.sessionType !== 'move') return;
            setInteraction({ isDragging: false, activeNodeId: null });
            if (process.env.NODE_ENV === 'development') {
                flushObserver();
            }
        }

        canvasBus.on('session.start', onSessionStart);
        canvasBus.on('session.update', onSessionUpdate);
        canvasBus.on('session.commit', onSessionEnd);
        canvasBus.on('session.cancel', onSessionEnd);

        return () => {
            canvasBus.off('session.start', onSessionStart);
            canvasBus.off('session.update', onSessionUpdate);
            canvasBus.off('session.commit', onSessionEnd);
            canvasBus.off('session.cancel', onSessionEnd);
        };
    }, []);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;
        if (typeof window === 'undefined') return;
        const previous = window.__droppleDebug;
        const api = {
            ...(previous || {}),
            nearest() {
                return {
                    tier: nearest.tier,
                    radius: nearest.radius,
                    primary: nearest.primary,
                    count: nearest.nearest.length,
                };
            },
        };
        window.__droppleDebug = api;

        return () => {
            if (window.__droppleDebug === api) {
                if (previous) {
                    window.__droppleDebug = previous;
                } else {
                    delete window.__droppleDebug;
                }
            }
        };
    }, [nearest]);

    const viewportBounds = useMemo(
        () => (viewport ? getViewportBounds(viewport, canvasSize) : null),
        [viewport, canvasSize]
    );
    const worldNodes = useMemo(() => Object.values(runtimeNodes || {}), [runtimeNodes]);
    const worldBounds = useMemo(() => computeWorldBounds(worldNodes), [worldNodes]);
    const viewportNodeCount = useMemo(() => {
        if (!viewportBounds) return 0;
        return worldNodes.filter((node) => {
            if (!node) return false;
            const minX = node.x ?? 0;
            const minY = node.y ?? 0;
            const maxX = minX + (node.width ?? 0);
            const maxY = minY + (node.height ?? 0);
            return (
                minX <= viewportBounds.maxX &&
                maxX >= viewportBounds.minX &&
                minY <= viewportBounds.maxY &&
                maxY >= viewportBounds.minY
            );
        }).length;
    }, [viewportBounds, worldNodes]);

    const snapCandidates = useMemo(() => {
        if (!interaction.isDragging || !interaction.activeNodeId) return [];
        const moving = runtimeNodes?.[interaction.activeNodeId];
        if (!moving) return [];

        const snapRadius = getSnapRadius(zoomTier);
        if (snapRadius <= 0) return [];

        const movingBounds = {
            x: moving.x ?? 0,
            y: moving.y ?? 0,
            width: moving.width ?? 0,
            height: moving.height ?? 0,
        };

        const targets = Array.isArray(nearest.nearest)
            ? nearest.nearest
                  .filter((entry) => entry.id !== interaction.activeNodeId)
                  .map((entry) => ({
                      id: entry.id,
                      x: entry.bounds.x,
                      y: entry.bounds.y,
                      width: entry.bounds.width,
                      height: entry.bounds.height,
                  }))
            : [];

        return computeSnapCandidates({
            movingBounds,
            targets,
            snapRadius,
        });
    }, [interaction.isDragging, interaction.activeNodeId, runtimeNodes, nearest, zoomTier]);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;
        if (typeof window === 'undefined') return;

        observerPayloadRef.current = {
            world: {
                bounds: worldBounds,
                nodeCount: worldNodes.length,
                viewportNodeCount,
            },
            camera: {
                x: viewport?.x ?? 0,
                y: viewport?.y ?? 0,
                scale: viewport?.scale ?? 1,
                zoomTier,
            },
            interaction: {
                cursorWorld,
                isDragging: interaction.isDragging,
                activeNodeId: interaction.activeNodeId,
            },
            nearest: {
                primary: nearest.primary,
                list: nearest.nearest,
                radius: nearest.radius,
            },
            snap: {
                candidates: snapCandidates,
            },
        };
        scheduleObserver();
    }, [
        worldBounds,
        worldNodes,
        viewportNodeCount,
        viewport,
        zoomTier,
        cursorWorld,
        interaction,
        nearest,
        snapCandidates,
    ]);

    useEffect(() => {
        if (workspace?.profile !== 'ux-validation') {
            setValidationIssues([]);
            return;
        }
        const isDev = process.env.NODE_ENV === 'development';

        const input = {
            nodes: worldNodes,
            camera: {
                x: viewport?.x ?? 0,
                y: viewport?.y ?? 0,
                scale: viewport?.scale ?? 1,
                zoomTier,
            },
            viewportBounds,
            zoomTier,
        };

        const frozenInput = isDev ? deepFreeze(input) : input;
        const issues = validateUX(frozenInput);
        const frozenIssues = isDev ? deepFreeze(issues) : issues;

        if (isDev && typeof window !== 'undefined') {
            const previous = window.__droppleDebug;
            window.__droppleDebug = {
                ...(previous || {}),
                validationIssues: frozenIssues,
            };
        }
        setValidationIssues(frozenIssues);
    }, [workspace?.profile, worldNodes, viewport, viewportBounds, zoomTier]);

    useEffect(
        () => () => {
            if (observerFrameRef.current) {
                cancelAnimationFrame(observerFrameRef.current);
                observerFrameRef.current = null;
            }
        },
        []
    );

    function getLocalPoint(e) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return null;
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    function handlePointerDown(e) {
        if (allowPan && e.button === 1) {
            e.preventDefault();
            panRef.current = {
                active: true,
                startX: e.clientX,
                startY: e.clientY,
                originX: viewport?.x ?? 0,
                originY: viewport?.y ?? 0,
            };
            e.currentTarget.setPointerCapture?.(e.pointerId);
            return;
        }

        if (e.button !== 0) return;
        if (e.target !== e.currentTarget) return;

        const point = getLocalPoint(e);
        if (!point) return;
        selectionRef.current = { active: true, start: point, current: point };
        setSelectionRect({ x: point.x, y: point.y, width: 0, height: 0 });
    }

    function handlePointerMove(e) {
        const point = getLocalPoint(e);
        if (point && viewport) {
            const worldPoint = screenToWorld(point, viewport);
            setCursorWorld(worldPoint);
        }

        if (panRef.current.active && allowPan && viewport) {
            const dx = (e.clientX - panRef.current.startX) / viewport.scale;
            const dy = (e.clientY - panRef.current.startY) / viewport.scale;
            setViewport({
                x: panRef.current.originX - dx,
                y: panRef.current.originY - dy,
            });
            return;
        }

        if (!selectionRef.current.active || !point) return;

        selectionRef.current.current = point;
        const x = Math.min(selectionRef.current.start.x, point.x);
        const y = Math.min(selectionRef.current.start.y, point.y);
        const width = Math.abs(point.x - selectionRef.current.start.x);
        const height = Math.abs(point.y - selectionRef.current.start.y);
        setSelectionRect({ x, y, width, height });
    }

    function finishSelection() {
        if (!selectionRef.current.active) return;
        const { start, current } = selectionRef.current;
        selectionRef.current = { active: false, start: null, current: null };

        if (!start || !current || !viewport) {
            setSelectionRect(null);
            return;
        }

        const minX = Math.min(start.x, current.x);
        const minY = Math.min(start.y, current.y);
        const maxX = Math.max(start.x, current.x);
        const maxY = Math.max(start.y, current.y);
        const width = maxX - minX;
        const height = maxY - minY;

        setSelectionRect(null);

        if (width < 6 || height < 6) {
            clearSelection?.();
            return;
        }

        const worldMin = screenToWorld({ x: minX, y: minY }, viewport);
        const worldMax = screenToWorld({ x: maxX, y: maxY }, viewport);

        const selected = Object.values(nodes)
            .filter((node) => {
                if (!node) return false;
                const nodeX = node.x ?? 0;
                const nodeY = node.y ?? 0;
                const nodeW = node.width ?? 0;
                const nodeH = node.height ?? 0;
                const nodeMaxX = nodeX + nodeW;
                const nodeMaxY = nodeY + nodeH;

                return (
                    nodeX <= worldMax.x &&
                    nodeMaxX >= worldMin.x &&
                    nodeY <= worldMax.y &&
                    nodeMaxY >= worldMin.y
                );
            })
            .map((node) => node.id);

        setSelectedIds?.(selected);
    }

    function handlePointerUp(e) {
        if (panRef.current.active) {
            panRef.current.active = false;
            e.currentTarget.releasePointerCapture?.(e.pointerId);
        }
        finishSelection(e);
    }

    function handlePointerCancel(e) {
        panRef.current.active = false;
        finishSelection(e);
    }

    function handleWheel(e) {
        if (!allowZoom || !viewport) return;
        e.preventDefault();

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const cursor = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        const zoomFactor = 0.001;
        const nextScale = Math.min(
            maxZoom,
            Math.max(minZoom, viewport.scale - e.deltaY * zoomFactor)
        );

        const world = screenToWorld(cursor, viewport);

        setViewport({
            scale: nextScale,
            x: world.x - cursor.x / nextScale,
            y: world.y - cursor.y / nextScale,
        });
    }

    const showValidationOverlays =
        debugEnabled &&
        process.env.NODE_ENV === 'development' &&
        workspace?.profile === 'ux-validation' &&
        validationVisible;

    const content = (
        <CanvasProvider value={{ zoomTier }}>
            <CanvasHost
                ref={containerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onWheel={handleWheel}
            >
                <div style={{ position: 'absolute', inset: 0 }}>
                    <CanvasSurface surface={canvasSurface} viewport={viewport} />
                    {canvasPolicy?.type === 'infinite' && <CanvasOriginMarker />}
                    <NodeLayer />
                    <GhostLayer />
                    <GuideLayer />
                    {showValidationOverlays && (
                        <ValidationOverlayLayer
                            nodesById={runtimeNodes}
                            canvasSize={canvasSize}
                        />
                    )}
                    <SelectionLayer />
                    <RemoteSelections />
                </div>
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                    }}
                >
                    <RemoteCursors />
                    {debugEnabled && cursorWorld && (
                        <CanvasNearestDebugOverlay
                            viewport={viewport}
                            worldPoint={cursorWorld}
                            radius={nearest.radius}
                            results={nearest.nearest}
                        />
                    )}
                    {selectionRect && (
                        <div
                            aria-hidden
                            style={{
                                position: 'absolute',
                                left: selectionRect.x,
                                top: selectionRect.y,
                                width: selectionRect.width,
                                height: selectionRect.height,
                                border: '1px dashed #94a3b8',
                                background: 'rgba(148, 163, 184, 0.08)',
                            }}
                        />
                    )}
                    {debugEnabled && viewportBounds && (
                        <CanvasDebugOverlay
                            viewport={viewport}
                            bounds={viewportBounds}
                            cursor={cursorWorld}
                            zoomTier={zoomTier}
                            suggestionsVisible={suggestionsVisible}
                            onToggleSuggestions={
                                process.env.NODE_ENV === 'development'
                                    ? () => setSuggestionsVisible((prev) => !prev)
                                    : null
                            }
                            validationsVisible={validationVisible}
                            onToggleValidations={
                                process.env.NODE_ENV === 'development'
                                    ? workspace?.profile === 'ux-validation'
                                        ? () => setValidationVisible((prev) => !prev)
                                        : null
                                    : null
                            }
                            onToggle={() => setDebugEnabled(false)}
                        />
                    )}
                    {debugEnabled && process.env.NODE_ENV === 'development' && (
                        <SuggestionPanel visible={suggestionsVisible} />
                    )}
                    {debugEnabled &&
                        process.env.NODE_ENV === 'development' &&
                        workspace?.profile === 'ux-validation' && (
                            <ValidationPanel visible={validationVisible} />
                        )}
                    {debugEnabled && (
                        <Minimap
                            nodes={worldNodes}
                            camera={viewport}
                            viewportBounds={viewportBounds}
                        />
                    )}
                    {!debugEnabled && (
                        <button
                            onClick={() => setDebugEnabled(true)}
                            style={{
                                position: 'absolute',
                                right: 16,
                                top: 16,
                                background: 'rgba(15, 23, 42, 0.65)',
                                color: '#e2e8f0',
                                border: '1px solid rgba(226,232,240,0.3)',
                                borderRadius: 6,
                                fontSize: 10,
                                padding: '4px 6px',
                                cursor: 'pointer',
                                pointerEvents: 'auto',
                            }}
                        >
                            Debug (Shift+D)
                        </button>
                    )}
                    {workspace?.capabilities?.timeline && (
                        <div style={{ pointerEvents: 'auto' }}>
                            <TimelinePanel designState={designState} />
                        </div>
                    )}
                </div>
            </CanvasHost>
        </CanvasProvider>
    );

    perfEnd('canvas.render');
    return content;
}

function deepFreeze(value) {
    if (!value || typeof value !== 'object') return value;
    Object.freeze(value);
    Object.values(value).forEach((child) => deepFreeze(child));
    return value;
}

function computeWorldBounds(nodes) {
    let minX = 0;
    let minY = 0;
    let maxX = 0;
    let maxY = 0;

    nodes.forEach((node) => {
        if (!node) return;
        const x = node.x ?? 0;
        const y = node.y ?? 0;
        const w = node.width ?? 0;
        const h = node.height ?? 0;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + w);
        maxY = Math.max(maxY, y + h);
    });

    const width = Math.max(1, maxX - minX);
    const height = Math.max(1, maxY - minY);
    const padding = Math.max(width, height) * 0.1;

    return {
        minX: minX - padding,
        minY: minY - padding,
        maxX: maxX + padding,
        maxY: maxY + padding,
        width: width + padding * 2,
        height: height + padding * 2,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2,
    };
}
