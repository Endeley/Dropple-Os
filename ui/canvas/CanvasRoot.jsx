'use client';

import { useMemo, useRef, useState } from 'react';
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
import { getWorkspaceState, setViewport } from '@/runtime/state/workspaceState.js';
import { getZoomTier } from '@/ui/canvas/zoomTiers.js';
import { CanvasProvider } from '@/ui/canvas/CanvasContext.jsx';

/** 🔑 Prevent floating-point collapse */
const MIN_EFFECTIVE_ZOOM = 0.0005;

export default function CanvasRoot({ workspaceId }) {
    perfStart('canvas.render');

    const workspaceState = getWorkspaceState();
    const resolvedWorkspaceId = workspaceId ?? workspaceState?.id;
    const workspace = resolveWorkspacePolicy(resolvedWorkspaceId);
    const designState = getRuntimeState();

    const viewport = useWorkspaceState((s) => s.viewport);
    const canvasSurface = useWorkspaceState((s) => s.canvasSurface);
    const canvasPolicy = useWorkspaceState((s) => s.canvasPolicy);

    const nodes = useAnimatedRuntimeStore((s) => s.nodes);
    const runtimeNodes = useRuntimeStore((s) => s.nodes);

    const setSelectedIds = useSelectionStore((s) => s.setSelectedIds);
    const clearSelection = useSelectionStore((s) => s.clearSelection);

    const containerRef = useRef(null);
    const panRef = useRef({ active: false, x: 0, y: 0 });

    const [cursorWorld, setCursorWorld] = useState(null);

    const allowPan = canvasPolicy?.allowPan ?? true;
    const allowZoom = canvasPolicy?.allowZoom ?? true;

    const minZoom = canvasPolicy?.minZoom ?? 0.002;
    const maxZoom = canvasPolicy?.maxZoom ?? 8;

    const zoomTier = useMemo(() => getZoomTier(viewport?.scale ?? 1), [viewport?.scale]);

    function getLocalPoint(e) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return null;
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function handlePointerDown(e) {
        if (allowPan && e.button === 1) {
            panRef.current = {
                active: true,
                x: e.clientX,
                y: e.clientY,
            };
            e.currentTarget.setPointerCapture?.(e.pointerId);
        }
    }

    function handlePointerMove(e) {
        const point = getLocalPoint(e);
        if (point && viewport) {
            setCursorWorld(screenToWorld(point, viewport));
        }

        if (!panRef.current.active || !allowPan) return;

        const dx = (e.clientX - panRef.current.x) / viewport.scale;
        const dy = (e.clientY - panRef.current.y) / viewport.scale;

        panRef.current.x = e.clientX;
        panRef.current.y = e.clientY;

        setViewport({
            x: viewport.x - dx,
            y: viewport.y - dy,
        });
    }

    function handlePointerUp(e) {
        panRef.current.active = false;
        e.currentTarget.releasePointerCapture?.(e.pointerId);
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

        const worldBefore = screenToWorld(cursor, viewport);

        // Natural zoom (scroll up = zoom in)
        const zoomFactor = Math.exp(-e.deltaY * 0.001);
        let nextScale = viewport.scale * zoomFactor;

        let nextX = viewport.x;
        let nextY = viewport.y;

        // 🔁 Precision rebasing (true infinity)
        if (nextScale < MIN_EFFECTIVE_ZOOM) {
            const REBASE = 1000;
            nextScale *= REBASE;
            nextX /= REBASE;
            nextY /= REBASE;
        }

        // 🧠 Soft UX limits (NOT real bounds)
        nextScale = Math.min(32, Math.max(1e-9, nextScale));

        setViewport({
            scale: nextScale,
            x: worldBefore.x - cursor.x / nextScale,
            y: worldBefore.y - cursor.y / nextScale,
        });
    }

    const content = (
        <CanvasProvider value={{ zoomTier }}>
            <CanvasHost ref={containerRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onWheel={handleWheel}>
                {/* 🌍 WORLD SPACE — MUST RECEIVE POINTER EVENTS */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'auto',
                    }}>
                    <CanvasSurface surface={canvasSurface} viewport={viewport} />
                    {canvasPolicy?.type === 'infinite' && <CanvasOriginMarker />}
                    <NodeLayer />
                    <GhostLayer />
                    <GuideLayer />
                    <SelectionLayer />
                    <RemoteSelections />
                </div>

                {/* 🧭 SCREEN-SPACE UI */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                    }}>
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

    perfEnd('canvas.render');
    return content;
}
