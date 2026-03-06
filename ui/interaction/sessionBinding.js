import { canvasBus } from '../eventBus/canvasBus.js';
import { InputSessionManager } from '@/runtime/interactions/input/InputSessionManager.js';
import { getWorkspaceProjection } from '@/runtime/projection';
import { screenToWorld } from '@/canvas/transform/screenToWorld.js';
import { setAimTarget } from '@/runtime/characters/characterRegistry.js';
import { registerNodeDragBridge } from '@/ui/bridges/nodeDragBridge.js';
import { registerNodeCreateBridge } from '@/ui/bridges/nodeCreateBridge.js';
import { registerNodeUpdateBridge } from '@/ui/bridges/nodeUpdateBridge.js';
import { registerViewportBridge } from '@/ui/bridges/viewportBridge.js';
import { registerWorkspaceBridge } from '@/ui/bridges/workspaceBridge.js';
import { registerCanvasSurfaceBridge } from '@/ui/bridges/canvasSurfaceBridge.js';
import { registerTimelineBridge } from '@/ui/bridges/timelineBridge.js';
import { registerHistoryBridge } from '@/ui/bridges/historyBridge.js';
import { registerGroupSessionBridge } from '@/ui/bridges/groupSessionBridge.js';
import { registerSessionBridge } from '@/ui/bridges/sessionBridge.js';
import { registerSessionCommitBridge } from '@/ui/bridges/sessionCommitBridge.js';
import { registerAnimationKeyframeBridge } from '@/ui/bridges/animationKeyframeBridge.js';
import { registerEditEventBridge } from '@/ui/bridges/editEventBridge.js';
import { registerAlignmentBridge } from '@/ui/bridges/alignmentBridge.js';
import { registerLayoutConvertBridge } from '@/ui/bridges/layoutConvertBridge.js';

export function registerSessionBindings(dispatcher) {
    const dispatch = dispatcher?.dispatch;
    registerNodeDragBridge(dispatch);
    registerNodeCreateBridge(dispatch);
    registerNodeUpdateBridge(dispatcher);
    registerViewportBridge(dispatcher);
    registerWorkspaceBridge(dispatcher);
    registerCanvasSurfaceBridge(dispatch);
    registerTimelineBridge(dispatcher);
    registerHistoryBridge(dispatcher);
    registerGroupSessionBridge();
    registerSessionBridge();
    registerSessionCommitBridge(dispatch);
    registerAnimationKeyframeBridge(dispatch);
    registerEditEventBridge(dispatch);
    registerAlignmentBridge(dispatcher);
    registerLayoutConvertBridge(dispatcher);
}

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
