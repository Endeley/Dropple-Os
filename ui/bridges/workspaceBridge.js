import { canvasBus } from '../eventBus/canvasBus.js';
import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';
import { EventTypes } from '@/core/events/eventTypes.js';

let registered = false;
let warnedMissingDispatcher = false;

function safeDispatch(event) {
    try {
        const dispatcher = getRuntimeDispatcher();
        dispatcher.dispatch(event);
    } catch (err) {
        if (!warnedMissingDispatcher) {
            console.warn(
                '[workspaceBridge] Dispatcher not available; skipping workspace intent.',
                err,
            );
            warnedMissingDispatcher = true;
        }
    }
}

export function registerWorkspaceBridge() {
    if (registered) return () => {};
    registered = true;

    const onSetActive = (intent) => {
        const workspaceId = intent?.workspaceId ?? intent?.id;
        if (!workspaceId) return;
        const workspaceDef = intent?.workspaceDef ?? null;
        safeDispatch({
            type: EventTypes.WORKSPACE_SET_ACTIVE,
            payload: workspaceDef
                ? { id: workspaceId, workspaceDef }
                : { workspaceId },
        });
    };

    canvasBus.on('intent.workspace.setActive', onSetActive);

    return () => {
        canvasBus.off('intent.workspace.setActive', onSetActive);
        registered = false;
    };
}
