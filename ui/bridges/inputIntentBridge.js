import { canvasBus } from '../eventBus/canvasBus.js';
import { handleInputEvent } from './inputEngineFacade.js';

let registered = false;

export function registerInputIntentBridge() {
    if (registered) return () => {};
    registered = true;

    const route = (inputType) => (payload) => {
        if (!payload) return null;

        return handleInputEvent(
            {
                type: inputType,
                event: payload.event,
                pointerId: payload.pointerId,
                worldPoint: payload.worldPoint,
            },
            {
                fallbackHandler: payload.fallbackHandler,
            },
        );
    };

    const onPointerDown = route('pointerdown');
    const onPointerMove = route('pointermove');
    const onPointerUp = route('pointerup');

    canvasBus.on('input.pointer.down', onPointerDown);
    canvasBus.on('input.pointer.move', onPointerMove);
    canvasBus.on('input.pointer.up', onPointerUp);

    return () => {
        canvasBus.off('input.pointer.down', onPointerDown);
        canvasBus.off('input.pointer.move', onPointerMove);
        canvasBus.off('input.pointer.up', onPointerUp);
        registered = false;
    };
}
