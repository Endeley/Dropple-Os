import { canvasBus } from '../eventBus/canvasBus.js';
import { EventTypes } from '@/core/events/eventTypes.js';

let registered = false;
let activeDispatch = null;
let activeRegistrations = 0;

export function registerWorkspaceBridge(dispatcher) {
    activeDispatch = dispatcher?.dispatch ?? null;
    activeRegistrations += 1;

    const onSetActive = (intent) => {
        const workspaceId = intent?.workspaceId ?? intent?.id;
        if (!workspaceId) return;
        const workspaceDef = intent?.workspaceDef ?? null;
        console.log('[workspaceBridge] translating workspace:', {
            id: workspaceId,
            hasDef: Boolean(workspaceDef),
            hasPolicy: Boolean(workspaceDef?.policy),
        });
        if (typeof activeDispatch === 'function') {
            activeDispatch({
                type: EventTypes.WORKSPACE_SET_ACTIVE,
                payload: workspaceDef
                    ? { id: workspaceId, workspaceDef }
                    : { workspaceId },
            });
        } else {
            console.warn(
                '[workspaceBridge] Dispatcher not provided; skipping workspace intent.'
            );
        }
    };

    if (!registered) {
        canvasBus.on('intent.workspace.setActive', onSetActive);
        registered = true;
    }

    return () => {
        activeRegistrations = Math.max(0, activeRegistrations - 1);
        if (activeRegistrations === 0) {
            canvasBus.off('intent.workspace.setActive', onSetActive);
            activeDispatch = null;
            registered = false;
        }
    };
}
