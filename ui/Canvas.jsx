'use client';

/**
 * @deprecated Legacy canvas entry.
 *
 * Canvas authoring now enters through:
 * CanvasRoot -> useCanvasInteractions -> inputEngine -> toolHandlerRegistrationFacade
 *
 * This module must not become a parallel pointer authority for workspace canvas
 * interactions. Keep it isolated from the canonical canvas lifecycle unless it is
 * explicitly migrated or removed.
 */

import { useEffect, useRef, useState } from 'react';
import { useWorkspaceVisualState } from '@/runtime/projection';
import { canvasBus } from './eventBus/canvasBus.js';
import { nodeCreateIntent } from '@/ui/creation/nodeCreateIntent';
import { NodeView } from './NodeView.jsx';
import { useSelection } from '@/ui/workspace/shared/SelectionContext';
import { SelectionBox } from '@/ui/selection/SelectionBox.jsx';

export default function Canvas() {
    const nodes = useWorkspaceVisualState((s) => s.nodes);
    const projectedSelectionBounds = useWorkspaceVisualState((s) => s.selectionBounds?.bounds ?? null);
    const nodeList = Object.values(nodes);

    const { selectedIds, selectSingle, setSelection, clear } = useSelection();
    const selectedNodes = selectedIds ? nodeList.filter((node) => selectedIds.has(node.id)) : [];
    const unselectedNodes = selectedIds ? nodeList.filter((node) => !selectedIds.has(node.id)) : nodeList;

    const selectionBounds = selectedNodes.length > 1 ? projectedSelectionBounds : null;
    const resizeDisabled = selectedNodes.some((node) => node?.resizeLocked);

    const containerRef = useRef(null);

    const [dragStart, setDragStart] = useState(null);
    const [dragCurrent, setDragCurrent] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const isIdle = (!selectedIds || selectedIds.size === 0) && nodeList.length === 0;

    /**
     * DEV-ONLY DEBUG API
     *
     * IMPORTANT INVARIANTS:
     * - Never available in production
     * - Never generates authoritative IDs
     * - Never bypasses dispatcher
     */
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const previous = window.__droppleDebug;

        if (process.env.NODE_ENV === 'development') {
            const api = {
                ...previous,

                createNodeDebug({ x = 40, y = 40, width = 160, height = 100 } = {}) {
                    nodeCreateIntent({
                        type: 'frame',
                        bounds: { x, y, width, height },
                    });
                },

                select(ids = []) {
                    setSelection?.(ids);
                },

                selectSingle(id) {
                    selectSingle?.(id);
                },

                clearSelection() {
                    clear?.();
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
        }

        // 🔒 Production hard guard
        Object.defineProperty(window, '__droppleDebug', {
            get() {
                throw new Error('__droppleDebug is not available in production builds');
            },
        });
    }, [clear, selectSingle, setSelection]);

    function getLocalPoint(e) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return null;
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    function resetDrag() {
        setIsDragging(false);
        setDragStart(null);
        setDragCurrent(null);
    }

    const onPointerDown = (e) => {
        canvasBus.emit('pointer.down', e);

        if (!isIdle) return;

        const point = getLocalPoint(e);
        if (!point) return;

        setDragStart(point);
        setDragCurrent(point);
        setIsDragging(true);
    };

    const onPointerMove = (e) => {
        canvasBus.emit('pointer.move', e);

        if (!isDragging) return;

        const point = getLocalPoint(e);
        if (!point) return;

        setDragCurrent(point);
    };

    const onPointerUp = (e) => {
        canvasBus.emit('pointer.up', e);

        if (!isDragging || !dragStart || !dragCurrent) {
            resetDrag();
            return;
        }

        const x = Math.min(dragStart.x, dragCurrent.x);
        const y = Math.min(dragStart.y, dragCurrent.y);
        const width = Math.abs(dragCurrent.x - dragStart.x);
        const height = Math.abs(dragCurrent.y - dragStart.y);

        if (width > 6 && height > 6) {
            nodeCreateIntent({
                type: 'frame',
                bounds: { x, y, width, height },
                source: 'canvas.drag',
            });
        }

        resetDrag();
    };

    const onPointerCancel = (e) => {
        canvasBus.emit('pointer.cancel', e);
        resetDrag();
    };

    function getCanvasSize() {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return null;
        return { width: rect.width, height: rect.height };
    }

    function startGroupMove(e) {
        if (selectedNodes.length < 2) return;

        canvasBus.emit('intent.group.move.start', {
            nodeIds: selectedNodes.map((node) => node.id),
            pointer: { x: e.clientX, y: e.clientY },
            modifiers: {
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                metaKey: e.metaKey,
                ctrlKey: e.ctrlKey,
            },
            originalEvent: e,
        });
    }

    function startGroupResize(e) {
        if (!selectionBounds || selectedNodes.length < 2) return;

        canvasBus.emit('intent.group.resize.start', {
            nodeIds: selectedNodes.map((node) => node.id),
            pointer: { x: e.clientX, y: e.clientY },
            handle: 'se',
            modifiers: {
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                metaKey: e.metaKey,
                ctrlKey: e.ctrlKey,
            },
            originalEvent: e,
        });
    }

    const ghostRect =
        isDragging && dragStart && dragCurrent
            ? {
                  x: Math.min(dragStart.x, dragCurrent.x),
                  y: Math.min(dragStart.y, dragCurrent.y),
                  width: Math.abs(dragCurrent.x - dragStart.x),
                  height: Math.abs(dragCurrent.y - dragStart.y),
              }
            : null;

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                background: '#fafafa',
                overflow: 'hidden',
                cursor: isIdle ? 'crosshair' : 'default',
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}>
            {ghostRect && (
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        left: ghostRect.x,
                        top: ghostRect.y,
                        width: ghostRect.width,
                        height: ghostRect.height,
                        border: '1px dashed #94a3b8',
                        background: 'rgba(148, 163, 184, 0.08)',
                        pointerEvents: 'none',
                        transition: 'all 80ms ease',
                    }}
                />
            )}

            {selectionBounds && (
                <SelectionBox
                    bounds={selectionBounds}
                    onMoveStart={startGroupMove}
                    onResizeStart={startGroupResize}
                    resizeDisabled={resizeDisabled}
                />
            )}

            {nodeList.map((node) => (
                <NodeView key={node.id} node={node} />
            ))}
        </div>
    );
}
