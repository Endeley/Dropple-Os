import { INTENTS } from '@/core/intents/intentTypes.js';
import { routeSurfaceIntent } from '@/runtime/osSurface/routeSurfaceIntent.js';
import { resolveWorkspaceContext } from '@/platform/workspaces/index.js';
import { OS_WORKSPACE_SHELL_ALLOWED_ACTIONS } from '@/runtime/osSurface/shellActionPolicy.js';

export { OS_WORKSPACE_SHELL_ALLOWED_ACTIONS } from '@/runtime/osSurface/shellActionPolicy.js';

export function dispatchOsSurfaceIntent(intent, dispatcher) {
    return routeSurfaceIntent(intent, dispatcher);
}

export function dispatchOsWorkspaceShellIntent({
    action,
    workspaceId = null,
    modeId = null,
    toolId = null,
    viewport = null,
} = {}, dispatcher) {
    if (!OS_WORKSPACE_SHELL_ALLOWED_ACTIONS.includes(action)) {
        return Object.freeze({
            ok: false,
            reason: 'unsupported-shell-action',
        });
    }

    if (action === 'workspace.activate') {
        return dispatchOsSurfaceIntent({
            type: INTENTS.WORKSPACE_ACTIVATE,
            payload: {
                workspaceId,
            },
        }, dispatcher);
    }

    if (action === 'mode.activate') {
        let resolved = null;
        try {
            resolved = resolveWorkspaceContext({
                workspace: workspaceId,
                mode: modeId,
            });
        } catch {
            return Object.freeze({
                ok: false,
                reason: 'invalid-shell-action-payload',
            });
        }
        return dispatchOsSurfaceIntent({
            type: INTENTS.WORKSPACE_ACTIVATE,
            payload: {
                workspaceId: resolved.workspaceId ?? workspaceId,
            },
        }, dispatcher);
    }

    if (action === 'tool.activate') {
        return dispatchOsSurfaceIntent({
            type: INTENTS.TOOL_SET_ACTIVE,
            payload: {
                toolId,
            },
        }, dispatcher);
    }

    if (action === 'viewport.set') {
        return dispatchOsSurfaceIntent({
            type: INTENTS.VIEWPORT_SET,
            payload: viewport && typeof viewport === 'object' ? { viewport } : {},
        }, dispatcher);
    }
}
