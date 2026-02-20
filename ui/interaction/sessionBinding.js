import { canvasBus } from '@/infrastructure/eventBus/canvasBus.js';
import { InputSessionManager } from '@/runtime/interactions/input/InputSessionManager.js';
import { getWorkspaceProjection } from '@/runtime/projection';
import { screenToWorld } from '@/canvas/transform/screenToWorld.js';
import { setAimTarget } from '@/runtime/characters/characterRegistry.js';
import { registerSessionRuntimeBridge } from '@/runtime/input/sessionRuntimeBridge.js';

registerSessionRuntimeBridge();

const sessionManager = new InputSessionManager(canvasBus);

// pointer down
canvasBus.on('pointer.down', ({ session, event }) => {
    sessionManager.startSession(session, event);
});

// pointer move
canvasBus.on('pointer.move', (event) => {
    if (event?.clientX != null && event?.clientY != null && event?.currentTarget) {
        const rect = event.currentTarget.getBoundingClientRect?.();
        if (rect) {
            const viewport = getWorkspaceProjection()?.viewport;
            if (viewport && Number.isFinite(viewport.scale)) {
                const screenPoint = {
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top,
                };
                const worldPoint = screenToWorld(screenPoint, viewport);
                setAimTarget(worldPoint);
            }
        }
    }
    sessionManager.updateSession(event);
});

// pointer up
canvasBus.on('pointer.up', () => {
    sessionManager.commitSession();
});

// pointer cancel
canvasBus.on('pointer.cancel', () => {
    sessionManager.cancelSession();
});

export { sessionManager };
