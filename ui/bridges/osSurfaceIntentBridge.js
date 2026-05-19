import { INTENTS } from '@/core/intents/intentTypes.js';
import { routeSurfaceIntent } from '@/runtime/osSurface/routeSurfaceIntent.js';

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
    if (action === 'workspace.activate') {
        return dispatchOsSurfaceIntent({
            type: INTENTS.WORKSPACE_ACTIVATE,
            payload: {
                workspaceId,
                modeId,
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

    return Object.freeze({
        ok: false,
        reason: 'unsupported-shell-action',
    });
}
