import { useCallback, useEffect, useRef } from 'react';
import { handleInputEvent } from '@/ui/bridges/inputEngineFacade.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { TOOL_DEFINITION_BY_ID } from '@/ui/tools/toolDefinitions';
import { nodeCreateIntent } from '@/ui/creation/nodeCreateIntent';
import { resolveTargetNodeId } from '@/ui/interactions/resolveTargetNodeId.js';
import {
    beginCreateSessionFederation,
    closeCreateSessionFederation,
    sealCreateSessionFederationCommit,
    updateCreateSessionFederationPreview,
} from '@/ui/bridges/createSessionFederationBridge.js';

function assertCreateSessionInvariant(condition, reason, details = {}) {
    if (condition) return;
    const orderedDetails = {};
    for (const key of Object.keys(details).sort()) {
        orderedDetails[key] = details[key];
    }
    throw new Error(
        JSON.stringify({
            scope: 'ui-create-session',
            reason,
            details: orderedDetails,
        }),
    );
}

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
    const primaryPointerSessionRef = useRef(null);
    const primaryPointerCleanupRef = useRef(null);
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
                    modifiers: overrides?.modifiers ?? {
                        shift: Boolean(e?.shiftKey),
                        alt: Boolean(e?.altKey),
                        ctrl: Boolean(e?.ctrlKey),
                        meta: Boolean(e?.metaKey),
                    },
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

    const clearPrimaryPointerSession = useCallback(() => {
        primaryPointerSessionRef.current = null;

        if (typeof primaryPointerCleanupRef.current === 'function') {
            primaryPointerCleanupRef.current();
            primaryPointerCleanupRef.current = null;
        }
    }, []);

    const cancelPrimaryInteraction = useCallback(
        (e) => {
            if (!e.defaultPrevented) {
                e.stopPropagation?.();
            }

            if (overlaySessionRef.current) {
                if (createSessionRef.current?.sessionId) {
                    closeCreateSessionFederation({ sessionId: createSessionRef.current.sessionId, dispatcher });
                }
                createSessionRef.current = null;
                dragStartRef.current = null;
                setOverlayDebug('idle');
                return;
            }

            if (!createSessionRef.current) {
                routePointerInput('pointercancel', e);
            } else if (createSessionRef.current?.sessionId) {
                closeCreateSessionFederation({ sessionId: createSessionRef.current.sessionId, dispatcher });
            }

            createSessionRef.current = null;
            dragStartRef.current = null;
            setOverlayDebug('idle');

            e.currentTarget.releasePointerCapture?.(e.pointerId);
        },
        [dispatcher, routePointerInput],
    );

    const bindPrimaryPointerSession = useCallback(
        (event) => {
            if (typeof window === 'undefined') return;

            clearPrimaryPointerSession();

            const session = {
                pointerId: event.pointerId,
            };

            primaryPointerSessionRef.current = session;

            const handlePointerCancel = (nextEvent) => {
                if (primaryPointerSessionRef.current?.pointerId !== nextEvent.pointerId) return;
                cancelPrimaryInteraction(nextEvent);
                clearPrimaryPointerSession();
            };

            window.addEventListener('pointercancel', handlePointerCancel, true);

            primaryPointerCleanupRef.current = () => {
                window.removeEventListener('pointercancel', handlePointerCancel, true);
            };
        },
        [cancelPrimaryInteraction, clearPrimaryPointerSession],
    );

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
            clearPrimaryPointerSession();
        },
        [clearOverlaySession, clearPrimaryPointerSession],
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
                if (createSessionRef.current?.sessionId) {
                    closeCreateSessionFederation({ sessionId: createSessionRef.current.sessionId, dispatcher });
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
                modifiers: {
                    shift: Boolean(e.shiftKey),
                    alt: Boolean(e.altKey),
                    ctrl: Boolean(e.ctrlKey),
                    meta: Boolean(e.metaKey),
                },
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
                beginCreateSessionFederation({
                    dispatcher,
                    sessionId: createSessionRef.current.sessionId,
                    pointerId: e.pointerId,
                    tool,
                    nodeType: toolDef.nodeType,
                });
                e.currentTarget.setPointerCapture?.(e.pointerId);
                setOverlayDebug(`${tool}:create-start`);
                setCreateSessionDebug(`${tool}:session-active`);
                return;
            }

            e.currentTarget.setPointerCapture?.(e.pointerId);
            bindPrimaryPointerSession(e);
            setOverlayDebug(`${tool}:pending`);
        },
        [bindPrimaryPointerSession, dispatcher, getActiveToolId, toWorldPoint],
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
                updateCreateSessionFederationPreview({
                    dispatcher,
                    sessionId: createSessionRef.current.sessionId,
                    bounds: {
                        x: Math.min(createSessionRef.current.start.x, worldPoint.x),
                        y: Math.min(createSessionRef.current.start.y, worldPoint.y),
                        width: Math.abs(worldPoint.x - createSessionRef.current.start.x),
                        height: Math.abs(worldPoint.y - createSessionRef.current.start.y),
                    },
                });
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
                    modifiers: {
                        ...dragStartRef.current.modifiers,
                        shift:
                            dragStartRef.current.modifiers?.shift === true ||
                            Boolean(e.shiftKey),
                        alt:
                            dragStartRef.current.modifiers?.alt === true ||
                            Boolean(e.altKey),
                        ctrl:
                            dragStartRef.current.modifiers?.ctrl === true ||
                            Boolean(e.ctrlKey),
                        meta:
                            dragStartRef.current.modifiers?.meta === true ||
                            Boolean(e.metaKey),
                    },
                });
            }

            if (dragStartRef.current?.hasMoved) {
                setOverlayDebug(`${dragStartRef.current.tool}:drag-move`);
            }

            routePointerInput('pointermove', e);
        },
        [dispatcher, routePointerInput, toWorldPoint],
    );

    const onPointerUp = useCallback(
        (e) => {
            if (e.defaultPrevented) return;
            e.stopPropagation();

            if (overlaySessionRef.current) {
                if (createSessionRef.current?.sessionId) {
                    closeCreateSessionFederation({ sessionId: createSessionRef.current.sessionId, dispatcher });
                }
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
                    const federationSnapshot = sealCreateSessionFederationCommit({
                        dispatcher,
                        sessionId,
                    });

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
                                federationSnapshot,
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
                closeCreateSessionFederation({ sessionId, dispatcher });
                assertCreateSessionInvariant(
                    createSessionRef.current === null,
                    'create-session',
                    'SESSION_NOT_RELEASED',
                    { sessionId },
                );
                setOverlayDebug('idle');
                setCreateSessionDebug(`${tool}:session-closed:${sessionId}`);
                e.currentTarget.releasePointerCapture?.(e.pointerId);
                clearPrimaryPointerSession();
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
            clearPrimaryPointerSession();

            e.currentTarget.releasePointerCapture?.(e.pointerId);
        },
        [clearPrimaryPointerSession, dispatcher, getDefaultParentId, routePointerInput],
    );

    const onPointerCancel = useCallback(
        (e) => {
            cancelPrimaryInteraction(e);
            clearPrimaryPointerSession();
        },
        [cancelPrimaryInteraction, clearPrimaryPointerSession],
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
