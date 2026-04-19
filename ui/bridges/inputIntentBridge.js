import { canvasBus } from '../eventBus/canvasBus.js';
import { handleInputEvent } from './inputEngineFacade.js';

let registered = false;

/**
 * INPUT INTENT BRIDGE
 *
 * Lawful path:
 * UI → canvasBus → input bridge → input engine → (preview OR commit) → dispatcher
 *
 * This bridge ensures:
 * - pointer events are routed correctly
 * - commit phase ALWAYS goes through dispatcher
 * - no UI-side mutation
 */

export function registerInputIntentBridge() {
    if (registered) return () => {};
    registered = true;

    const normalizeInputPayload = (inputType, payload) => {
        const rawResizeHandle = payload?.resizeHandle ?? payload?.handle ?? null;
        const resizeHandle =
            rawResizeHandle && typeof rawResizeHandle === 'object'
                ? rawResizeHandle.handle ?? null
                : rawResizeHandle;
        const targetNodeId =
            payload?.targetNodeId ??
            (rawResizeHandle && typeof rawResizeHandle === 'object'
                ? rawResizeHandle.nodeId ?? null
                : null);
        const tool =
            payload?.tool ??
            (resizeHandle ? 'resize' : payload?.rotate === true ? 'rotate' : undefined);

        return {
            type: inputType,
            event: payload?.event,
            pointerId: payload?.pointerId,
            worldPoint: payload?.worldPoint,
            targetNodeId,
            resizeHandle,
            handle: resizeHandle,
            bounds: payload?.bounds,
            nodeType: payload?.nodeType,
            parentId: payload?.parentId ?? payload?.defaultParentId ?? null,
            rotate: payload?.rotate === true,
            tool,
        };
    };

    const route = (inputType) => (payload) => {
        if (!payload) return null;
        const input = normalizeInputPayload(inputType, payload);

        const result = handleInputEvent(
            input,
            {
                fallbackHandler: payload.fallbackHandler,
                tool: input.tool,
            },
        );

        return result;
    };

    const onPointerDown = route('pointerdown');
    const onPointerMove = route('pointermove');
    const onPointerUp = route('pointerup');
    const onPointerCancel = route('pointercancel');

    canvasBus.on('input.pointer.down', onPointerDown);
    canvasBus.on('input.pointer.move', onPointerMove);
    canvasBus.on('input.pointer.up', onPointerUp);
    canvasBus.on('input.pointer.cancel', onPointerCancel);

    return () => {
        canvasBus.off('input.pointer.down', onPointerDown);
        canvasBus.off('input.pointer.move', onPointerMove);
        canvasBus.off('input.pointer.up', onPointerUp);
        canvasBus.off('input.pointer.cancel', onPointerCancel);
        registered = false;
    };
}
