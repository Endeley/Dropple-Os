import { useCallback, useEffect, useRef } from 'react';
import { handleInputEvent } from '@/ui/bridges/inputEngineFacade.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { TOOL_DEFINITION_BY_ID } from '@/ui/tools/toolDefinitions';
import { nodeCreateIntent } from '@/ui/creation/nodeCreateIntent';
import { resolveTargetNodeId } from '@/ui/interactions/resolveTargetNodeId.js';
import { assertCreateSessionInvariant } from '@/runtime/input/createSessionInvariant.js';

function setOverlayDebug(value) {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.droppleOverlayDebug = value;
}

function setCreateSessionDebug(value) {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.droppleCreateSessionDebug = value;
}

export function useCanvasInteractions({ dispatcher = null, getActiveToolId, getWorldPointFromEvent, getDefaultParentId }) {
    const createSessionRef = useRef(null);
    const createSessionOrdinalRef = useRef(0);
    const overlaySessionRef = useRef(null);
    const overlayCleanupRef = useRef(null);
    const handleDownRef = useRef(null);
    const dragStartRef = useRef(null);

    const DRAG_THRESHOLD = 6;

    const toWorldPoint = useCallback(
        (e) => {
            if (typeof getWorldPointFromEvent === 'function') {
                return getWorldPointFromEvent(e);
            }
            return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
        },
        [getWorldPointFromEvent],
    );

    const routePointerInput = useCallback(
        (type, e, overrides = null) => {
            const worldPoint = toWorldPoint(e);
            const tool = overrides?.tool ?? (typeof getActiveToolId === 'function' ? getActiveToolId(e) : 'select');

            const targetNodeId =
                overrides?.targetNodeId ??
                resolveTargetNodeId(e.target, {
                    x: e.clientX,
                    y: e.clientY,
                });

            return handleInputEvent(
                {
                    type,
                    event: e,
                    pointerId: e.pointerId,
                    worldPoint,
                    targetNodeId,
                    resizeHandle: overrides?.resizeHandle ?? null,
                },
                {
                    dispatcher,
                    tool,
                },
            );
        },
        [dispatcher, getActiveToolId, toWorldPoint],
    );

    const clearOverlaySession = useCallback(() => {
        setOverlayDebug('idle');
        overlaySessionRef.current = null;

        if (typeof overlayCleanupRef.current === 'function') {
            overlayCleanupRef.current();
            overlayCleanupRef.current = null;
        }
    }, []);

    const bindOverlayPointerSession = useCallback(
        (event, overrides) => {
            if (typeof window === 'undefined') return;

            clearOverlaySession();

            const session = {
                pointerId: event.pointerId,
                overrides,
            };

            overlaySessionRef.current = session;
            setOverlayDebug(`${overrides?.tool ?? 'unknown'}:start`);

            const handleMove = (nextEvent) => {
                if (overlaySessionRef.current?.pointerId !== nextEvent.pointerId) return;

                setOverlayDebug(`${overlaySessionRef.current?.overrides?.tool ?? 'unknown'}:pointermove`);

                routePointerInput('pointermove', nextEvent, overlaySessionRef.current.overrides);
            };

            const handleEnd = (type) => (nextEvent) => {
                if (overlaySessionRef.current?.pointerId !== nextEvent.pointerId) return;

                routePointerInput(type, nextEvent, overlaySessionRef.current.overrides);
                clearOverlaySession();
            };

            const handlePointerUp = handleEnd('pointerup');
            const handlePointerCancel = handleEnd('pointercancel');

            const handleMouseMove = (nextEvent) => {
                if (!overlaySessionRef.current) return;

                setOverlayDebug(`${overlaySessionRef.current?.overrides?.tool ?? 'unknown'}:mousemove`);

                routePointerInput('pointermove', nextEvent, overlaySessionRef.current.overrides);
            };

            const handleMouseUp = (nextEvent) => {
                if (!overlaySessionRef.current) return;

                setOverlayDebug(`${overlaySessionRef.current?.overrides?.tool ?? 'unknown'}:mouseup`);

                routePointerInput('pointerup', nextEvent, overlaySessionRef.current.overrides);

                clearOverlaySession();
            };

            window.addEventListener('pointermove', handleMove, true);
            window.addEventListener('pointerup', handlePointerUp, true);
            window.addEventListener('pointercancel', handlePointerCancel, true);
            window.addEventListener('mousemove', handleMouseMove, true);
            window.addEventListener('mouseup', handleMouseUp, true);

            overlayCleanupRef.current = () => {
                window.removeEventListener('pointermove', handleMove, true);
                window.removeEventListener('pointerup', handlePointerUp, true);
                window.removeEventListener('pointercancel', handlePointerCancel, true);
                window.removeEventListener('mousemove', handleMouseMove, true);
                window.removeEventListener('mouseup', handleMouseUp, true);
            };
        },
        [clearOverlaySession, routePointerInput],
    );

    useEffect(
        () => () => {
            clearOverlaySession();
        },
        [clearOverlaySession],
    );

    const isDuplicateHandleDown = useCallback((event, key) => {
        const previous = handleDownRef.current;
        const current = {
            key,
            type: event?.type ?? null,
            clientX: event?.clientX ?? null,
            clientY: event?.clientY ?? null,
            timeStamp: Number(event?.timeStamp ?? 0),
        };

        handleDownRef.current = current;

        if (!previous) return false;
        if (current.type !== 'mousedown') return false;
        if (previous.type !== 'pointerdown') return false;
        if (previous.key !== current.key) return false;
        if (previous.clientX !== current.clientX || previous.clientY !== current.clientY) {
            return false;
        }

        return Math.abs(current.timeStamp - previous.timeStamp) < 64;
    }, []);

    const onPointerDown = useCallback(
        (e) => {
            if (e.defaultPrevented) return;
            e.stopPropagation();

            if (createSessionRef.current || dragStartRef.current) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn(
                        '[useCanvasInteractions] clearing leaked interaction session before new pointerdown',
                    );
                }
                createSessionRef.current = null;
                dragStartRef.current = null;
                setOverlayDebug('idle');
            }

            const worldPoint = toWorldPoint(e);
            const tool = typeof getActiveToolId === 'function' ? getActiveToolId(e) : 'select';
            const toolDef = TOOL_DEFINITION_BY_ID[tool];

            const targetNodeId = resolveTargetNodeId(e.target, {
                x: e.clientX,
                y: e.clientY,
            });

            dragStartRef.current = {
                start: worldPoint,
                pointerId: e.pointerId,
                tool,
                targetNodeId,
                hasMoved: false,
            };

            if (toolDef?.createsNode && !targetNodeId) {
                createSessionOrdinalRef.current += 1;
                createSessionRef.current = {
                    sessionId: `${tool}:${createSessionOrdinalRef.current}`,
                    tool,
                    nodeType: toolDef.nodeType,
                    start: worldPoint,
                    current: worldPoint,
                    pointerId: e.pointerId,
                };
                e.currentTarget.setPointerCapture?.(e.pointerId);
                setOverlayDebug(`${tool}:create-start`);
                setCreateSessionDebug(`${tool}:session-active`);
                return;
            }

            e.currentTarget.setPointerCapture?.(e.pointerId);
            setOverlayDebug(`${tool}:pending`);
        },
        [getActiveToolId, toWorldPoint],
    );

    const onPointerMove = useCallback(
        (e) => {
            if (e.defaultPrevented) return;
            e.stopPropagation();

            if (overlaySessionRef.current) return;

            const worldPoint = toWorldPoint(e);

            if (createSessionRef.current) {
                createSessionRef.current = {
                    ...createSessionRef.current,
                    current: worldPoint,
                };
                setOverlayDebug(`${createSessionRef.current.tool}:create-drag`);
                return;
            }

            if (dragStartRef.current && !dragStartRef.current.hasMoved) {
                const dx = Math.abs(worldPoint.x - dragStartRef.current.start.x);
                const dy = Math.abs(worldPoint.y - dragStartRef.current.start.y);

                if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) {
                    return;
                }

                dragStartRef.current.hasMoved = true;
                setOverlayDebug(`${dragStartRef.current.tool}:drag-start`);

                routePointerInput('pointerdown', e, {
                    tool: dragStartRef.current.tool,
                    targetNodeId: dragStartRef.current.targetNodeId,
                });
            }

            if (dragStartRef.current?.hasMoved) {
                setOverlayDebug(`${dragStartRef.current.tool}:drag-move`);
            }

            routePointerInput('pointermove', e);
        },
        [routePointerInput, toWorldPoint],
    );

    const onPointerUp = useCallback(
        (e) => {
            if (e.defaultPrevented) return;
            e.stopPropagation();

            if (overlaySessionRef.current) {
                createSessionRef.current = null;
                dragStartRef.current = null;
                setOverlayDebug('idle');
                return;
            }

            if (createSessionRef.current) {
                const { start, current, nodeType, tool, pointerId, sessionId } = createSessionRef.current;
                const width = Math.abs(current.x - start.x);
                const height = Math.abs(current.y - start.y);
                const pointerMatches = pointerId === e.pointerId;
                const sessionState = {
                    tool,
                    width,
                    height,
                    pointerMatches,
                    commitAttempted: false,
                    committed: false,
                    commitResult: 'skipped',
                };

                if (pointerMatches && width > DRAG_THRESHOLD && height > DRAG_THRESHOLD) {
                    assertCreateSessionInvariant(
                        typeof sessionId === 'string' && sessionId.length > 0,
                        'create-session',
                        'MISSING_SESSION_ID',
                        { sessionId },
                    );
                    const bounds = {
                        x: Math.min(start.x, current.x),
                        y: Math.min(start.y, current.y),
                        width,
                        height,
                    };

                    const parentId = typeof getDefaultParentId === 'function' ? getDefaultParentId() : null;
                    sessionState.commitAttempted = true;

                    const handled = handleInputEvent(
                        {
                            type: EventTypes.INPUT_CREATE_COMMIT,
                            event: e,
                            worldPoint: start,
                            bounds,
                            nodeType,
                            parentId,
                            sessionId,
                            sessionState: {
                                active: createSessionRef.current != null,
                                pointerId,
                            },
                        },
                        {
                            dispatcher,
                            tool,
                            fallbackHandler() {
                                nodeCreateIntent({
                                    type: nodeType,
                                    bounds,
                                    parentId,
                                });
                                return { handled: true };
                            },
                        },
                    );

                    if (!handled) {
                        nodeCreateIntent({
                            type: nodeType,
                            bounds,
                                parentId,
                        });
                        sessionState.commitResult = 'fallback-intent';
                    } else {
                        sessionState.commitResult = 'engine-handled';
                    }
                    sessionState.committed = true;
                } else if (!pointerMatches) {
                    sessionState.commitResult = 'pointer-mismatch';
                } else {
                    sessionState.commitResult = 'threshold-not-met';
                }

                setCreateSessionDebug(
                    `${tool}:${sessionState.commitResult}:w=${Math.round(width)}:h=${Math.round(height)}:pointerMatch=${pointerMatches ? '1' : '0'}`,
                );

                createSessionRef.current = null;
                dragStartRef.current = null;
                assertCreateSessionInvariant(
                    createSessionRef.current === null,
                    'create-session',
                    'SESSION_NOT_RELEASED',
                    { sessionId },
                );
                setOverlayDebug('idle');
                setCreateSessionDebug(`${tool}:session-closed:${sessionId}`);
                e.currentTarget.releasePointerCapture?.(e.pointerId);
                return;
            }

            if (dragStartRef.current && !dragStartRef.current.hasMoved) {
                setOverlayDebug(`${dragStartRef.current.tool}:click`);

                routePointerInput('pointerdown', e, {
                    tool: dragStartRef.current.tool,
                    targetNodeId: dragStartRef.current.targetNodeId,
                });
            }

            routePointerInput('pointerup', e);

            dragStartRef.current = null;
            setOverlayDebug('idle');

            e.currentTarget.releasePointerCapture?.(e.pointerId);
        },
        [dispatcher, getDefaultParentId, routePointerInput],
    );

    const onPointerCancel = useCallback(
        (e) => {
            if (!e.defaultPrevented) {
                e.stopPropagation();
            }

            if (overlaySessionRef.current) {
                createSessionRef.current = null;
                dragStartRef.current = null;
                setOverlayDebug('idle');
                return;
            }

            if (!createSessionRef.current) {
                routePointerInput('pointercancel', e);
            }

            createSessionRef.current = null;
            dragStartRef.current = null;
            setOverlayDebug('idle');

            e.currentTarget.releasePointerCapture?.(e.pointerId);
        },
        [routePointerInput],
    );

    const onResizeHandlePointerDown = useCallback(
        (e, { nodeId, handle }) => {
            e.preventDefault();
            e.stopPropagation();

            if (isDuplicateHandleDown(e, `resize:${nodeId}:${handle}`)) return;

            const overrides = {
                tool: 'resize',
                targetNodeId: nodeId,
                resizeHandle: handle,
            };

            routePointerInput('pointerdown', e, overrides);
            bindOverlayPointerSession(e, overrides);
        },
        [bindOverlayPointerSession, isDuplicateHandleDown, routePointerInput],
    );

    const onResizeHandlePointerMove = useCallback(
        (e, { nodeId, handle }) => {
            e.preventDefault();
            e.stopPropagation();

            routePointerInput('pointermove', e, {
                tool: 'resize',
                targetNodeId: nodeId,
                resizeHandle: handle,
            });
        },
        [routePointerInput],
    );

    const onResizeHandlePointerUp = useCallback(
        (e, { nodeId, handle, type = 'pointerup' }) => {
            e.preventDefault();
            e.stopPropagation();

            routePointerInput(type, e, {
                tool: 'resize',
                targetNodeId: nodeId,
                resizeHandle: handle,
            });
        },
        [routePointerInput],
    );

    const onRotateHandlePointerDown = useCallback(
        (e, { nodeId }) => {
            e.preventDefault();
            e.stopPropagation();

            if (isDuplicateHandleDown(e, `rotate:${nodeId}`)) return;

            const overrides = {
                tool: 'rotate',
                targetNodeId: nodeId,
            };

            routePointerInput('pointerdown', e, overrides);
            bindOverlayPointerSession(e, overrides);
        },
        [bindOverlayPointerSession, isDuplicateHandleDown, routePointerInput],
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
