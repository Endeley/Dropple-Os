import { INTENTS } from '@/core/intents/intentTypes.js';
import { canvasBus } from '../eventBus/canvasBus.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { getWorkspaceContractDefinition } from '@/ui/bridges/workspaceActivationFacade.js';

let registered = false;
let activeDispatch = null;
let activeRegistrations = 0;

export function registerWorkspaceBridge(dispatcher) {
    activeDispatch = dispatcher?.dispatch ?? null;
    activeRegistrations += 1;

    const onSetActive = (intent) => {
        const workspaceId = intent?.workspaceId ?? intent?.id;
        if (!workspaceId) return;
        const workspaceDef = intent?.workspaceDef ?? getWorkspaceContractDefinition(workspaceId);
        if (!workspaceDef?.id) {
            console.warn('[workspaceBridge] Unable to resolve workspace contract.', workspaceId);
            return;
        }

        console.log('[workspaceBridge] translating workspace:', {
            id: workspaceDef.id,
            hasDef: Boolean(workspaceDef),
            hasPolicy: Boolean(workspaceDef?.policy),
        });

        if (typeof activeDispatch === 'function') {
            activeDispatch({
                type: EventTypes.WORKSPACE_SET_ACTIVE,
                payload: {
                    workspaceId: workspaceDef.id,
                    workspaceDef,
                },
            });
        } else {
            console.warn(
                '[workspaceBridge] Dispatcher not provided; skipping workspace intent.'
            );
        }
    };

    if (!registered) {
        canvasBus.on(INTENTS.WORKSPACE_ACTIVATE, onSetActive);
        registered = true;
    }

    return () => {
        activeRegistrations = Math.max(0, activeRegistrations - 1);
        if (activeRegistrations === 0) {
            canvasBus.off(INTENTS.WORKSPACE_ACTIVATE, onSetActive);
            activeDispatch = null;
            registered = false;
        }
    };
}
