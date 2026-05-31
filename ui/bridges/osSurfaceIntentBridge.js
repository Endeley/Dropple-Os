import { INTENTS } from '@/core/intents/intentTypes.js';
import { routeSurfaceIntent } from '@/runtime/osSurface/routeSurfaceIntent.js';
import { requestAssistantFromShellIntent } from '@/runtime/osSurface/requestAssistantFromShellIntent.js';
import { resolveWorkspaceContext } from '@/platform/workspaces/index.js';
import { OS_WORKSPACE_SHELL_ALLOWED_ACTIONS } from '@/runtime/osSurface/shellActionPolicy.js';

export { OS_WORKSPACE_SHELL_ALLOWED_ACTIONS } from '@/runtime/osSurface/shellActionPolicy.js';

export function dispatchOsSurfaceIntent(intent, dispatcher) {
    return routeSurfaceIntent(intent, dispatcher);
}

function resolveAssistantDispatcher(dispatcher) {
    if (dispatcher && typeof dispatcher.dispatch === 'function') return dispatcher;
    if (typeof dispatcher === 'function') {
        return Object.freeze({
            dispatch: dispatcher,
        });
    }
    return null;
}

export function dispatchOsWorkspaceShellIntent({
    action,
    workspaceId = null,
    modeId = null,
    perspectiveId = null,
    toolId = null,
    viewport = null,
    assistantId = null,
    assistantAction = null,
    assistantInput = null,
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

    if (action === 'assistant.request') {
        const assistantDispatcher = resolveAssistantDispatcher(dispatcher);
        if (!assistantDispatcher) {
            return Promise.resolve(
                Object.freeze({
                    ok: false,
                    reason: 'dispatch-unavailable',
                }),
            );
        }
        const normalizedAssistantId = typeof assistantId === 'string' ? assistantId.trim() : '';
        const normalizedAssistantAction =
            typeof assistantAction === 'string' ? assistantAction.trim() : '';
        if (!normalizedAssistantId || !normalizedAssistantAction) {
            return Promise.resolve(
                Object.freeze({
                ok: false,
                reason: 'invalid-shell-action-payload',
                }),
            );
        }
        if (assistantInput != null && typeof assistantInput !== 'object') {
            return Promise.resolve(
                Object.freeze({
                ok: false,
                reason: 'invalid-shell-action-payload',
                }),
            );
        }
        return requestAssistantFromShellIntent({
            dispatcher: assistantDispatcher,
            assistantId: normalizedAssistantId,
            assistantAction: normalizedAssistantAction,
            perspectiveId,
            assistantInput: assistantInput ?? null,
        })
            .then((result) =>
                Object.freeze({
                    ok: true,
                    action,
                    assistantId: normalizedAssistantId,
                    assistantAction: normalizedAssistantAction,
                    requestId: result.requestId,
                    eventType: result.eventType,
                }),
            )
            .catch((error) =>
                Object.freeze({
                    ok: false,
                    reason: error instanceof Error ? error.message : String(error),
                }),
            );
    }
}
