'use client';

import { useCallback } from 'react';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';

/**
 * UI → INTENT ONLY
 *
 * This hook:
 * - converts DOM pointer events → canonical input payload
 * - emits to canvasBus
 *
 * It does NOT:
 * - access dispatcher
 * - mutate runtime
 * - call tool handlers
 */
export function useCanvasInteractions({ getActiveToolId, getWorldPointFromEvent, getDefaultParentId } = {}) {
    const emitPointer = useCallback(
        (type, event) => {
            if (!event) return;

            const worldPoint = getWorldPointFromEvent
                ? getWorldPointFromEvent(event)
                : {
                      x: event.nativeEvent?.offsetX ?? 0,
                      y: event.nativeEvent?.offsetY ?? 0,
                  };

            const activeToolId = getActiveToolId ? getActiveToolId(event) : null;

            const payload = {
                type,
                event,
                pointerId: event.pointerId ?? 'mouse',
                worldPoint,
                tool: activeToolId,
                defaultParentId: getDefaultParentId ? getDefaultParentId() : null,
                targetNodeId: null, // resolved later in runtime layer
            };

            canvasBus.emit(`input.pointer.${type}`, payload);
        },
        [getActiveToolId, getWorldPointFromEvent, getDefaultParentId],
    );

    const onPointerDown = useCallback(
        (e) => {
            emitPointer('down', e);
        },
        [emitPointer],
    );

    const onPointerMove = useCallback(
        (e) => {
            emitPointer('move', e);
        },
        [emitPointer],
    );

    const onPointerUp = useCallback(
        (e) => {
            emitPointer('up', e);
        },
        [emitPointer],
    );

    const onPointerCancel = useCallback(
        (e) => {
            emitPointer('cancel', e);
        },
        [emitPointer],
    );

    /**
     * 🔥 Resize + Rotate handles ALSO emit intent
     * (UI does not decide behavior)
     */
    const onResizeHandlePointerDown = useCallback(
        (e, handle) => {
            const worldPoint = getWorldPointFromEvent ? getWorldPointFromEvent(e) : null;
            console.log('CANVAS ROOT EMIT →', {
                resizeHandle: handle,
                targetNodeId: handle?.nodeId ?? null,
            });

            canvasBus.emit('input.pointer.down', {
                type: 'pointerdown',
                event: e,
                pointerId: e.pointerId ?? 'mouse',
                worldPoint,
                resizeHandle: handle,
            });
        },
        [getWorldPointFromEvent],
    );

    const onResizeHandlePointerMove = useCallback(
        (e, handle) => {
            const worldPoint = getWorldPointFromEvent ? getWorldPointFromEvent(e) : null;

            canvasBus.emit('input.pointer.move', {
                type: 'pointermove',
                event: e,
                pointerId: e.pointerId ?? 'mouse',
                worldPoint,
                resizeHandle: handle,
            });
        },
        [getWorldPointFromEvent],
    );

    const onResizeHandlePointerUp = useCallback(
        (e, handle) => {
            const worldPoint = getWorldPointFromEvent ? getWorldPointFromEvent(e) : null;

            canvasBus.emit('input.pointer.up', {
                type: 'pointerup',
                event: e,
                pointerId: e.pointerId ?? 'mouse',
                worldPoint,
                resizeHandle: handle,
            });
        },
        [getWorldPointFromEvent],
    );

    const onRotateHandlePointerDown = useCallback(
        (e) => {
            const worldPoint = getWorldPointFromEvent ? getWorldPointFromEvent(e) : null;

            canvasBus.emit('input.pointer.down', {
                type: 'pointerdown',
                event: e,
                pointerId: e.pointerId ?? 'mouse',
                worldPoint,
                rotate: true,
            });
        },
        [getWorldPointFromEvent],
    );

    return {
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel,
        onResizeHandlePointerDown,
        onResizeHandlePointerMove,
        onResizeHandlePointerUp,
        onRotateHandlePointerDown,
    };
}
