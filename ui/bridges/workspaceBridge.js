import { canvasBus } from '../eventBus/canvasBus.js';
import { EventTypes } from '@/core/events/eventTypes.js';

let registered = false;

export function registerWorkspaceBridge(dispatcher) {
    if (registered) return () => {};
    registered = true;
    const dispatch = dispatcher?.dispatch;

    const onSetActive = (intent) => {
        const workspaceId = intent?.workspaceId ?? intent?.id;
        if (!workspaceId) return;
        const workspaceDef = intent?.workspaceDef ?? null;
        console.log('[workspaceBridge] translating workspace:', {
            id: workspaceId,
            hasDef: Boolean(workspaceDef),
            hasPolicy: Boolean(workspaceDef?.policy),
        });
        if (typeof dispatch === 'function') {
            dispatch({
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

    canvasBus.on('intent.workspace.setActive', onSetActive);

    return () => {
        canvasBus.off('intent.workspace.setActive', onSetActive);
        registered = false;
    };
}
