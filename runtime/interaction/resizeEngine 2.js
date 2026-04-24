// ...imports stay exactly the same

function resizeToolHandler(input, context) {
    const runtimeState = context.state;
    const dispatcher = context.dispatcher;
    const worldPoint = input.worldPoint;
    const drag = runtimeState?.interaction?.drag ?? null;

    if (!runtimeState || !dispatcher || !worldPoint) return null;

    // 🟢 POINTER DOWN — START RESIZE
    if (input.type === 'pointerdown') {
        const hit = resolvePrimaryHit(runtimeState, worldPoint, input.event, input.targetNodeId);
        const handle = input.resizeHandle ?? input.handle ?? null;

        if (!hit?.id || !handle) return null;

        const nodesById = getToolNodes(runtimeState);
        const rect = getNodeRect(nodesById[hit.id] ?? hit, runtimeState);

        // ✅ CORRECT: match startDrag contract (NO nested resize object)
        dispatcher.dispatch({
            type: EventTypes.DRAG_START,
            payload: {
                type: 'resize',
                nodeIds: [hit.id],
                pointer: worldPoint,

                // 🔥 must be top-level (your startDrag depends on this)
                handle,
                originBounds: rect,
            },
        });

        return { handled: true };
    }

    // 🛑 NOT IN RESIZE MODE
    if (!drag?.active || drag.type !== 'resize') return null;

    const activeNodeId = drag.nodeIds?.[0] ?? null;

    const nextDrag = {
        ...drag,
        currentPointer: worldPoint,
    };

    const delta = computeRawDragDelta(nextDrag);
    const nextBounds = computeResizeDelta(nextDrag, delta);

    // 🟡 POINTER MOVE — LIVE RESIZE
    if (input.type === 'pointermove') {
        dispatcher.dispatch({
            type: EventTypes.DRAG_UPDATE,
            payload: {
                pointer: worldPoint,
                guides: [],
            },
        });

        // 🔥 live layout update
        if (activeNodeId && nextBounds) {
            dispatchLayoutBulk(dispatcher, [
                {
                    id: activeNodeId,
                    x: nextBounds.x,
                    y: nextBounds.y,
                    width: nextBounds.width,
                    height: nextBounds.height,
                },
            ]);
        }

        return { handled: true };
    }

    // 🔴 POINTER UP — COMMIT
    if (input.type === 'pointerup' || input.type === 'pointercancel') {
        if (activeNodeId && nextBounds) {
            dispatchLayoutBulk(dispatcher, [
                {
                    id: activeNodeId,
                    x: nextBounds.x,
                    y: nextBounds.y,
                    width: nextBounds.width,
                    height: nextBounds.height,
                },
            ]);
        }

        dispatcher.dispatch({ type: EventTypes.DRAG_END });
        return { handled: true };
    }

    return null;
}
