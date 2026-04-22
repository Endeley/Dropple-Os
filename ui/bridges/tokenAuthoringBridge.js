import { EventTypes } from '@/core/events/eventTypes.js';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { TOKEN_AUTHORING_INTENTS } from '@/ui/workspace/system/tokenAuthoringIntent.js';

let registered = false;
let activeDispatcher = null;
let activeRegistrations = 0;

function dispatch() {
    return activeDispatcher?.dispatch ?? null;
}

export function registerTokenAuthoringBridge(dispatcher) {
    activeDispatcher = dispatcher ?? null;
    activeRegistrations += 1;

    const onCreateToken = (payload) =>
        dispatch()?.({
            type: EventTypes.TOKEN_CREATE,
            payload: {
                tokenPath: payload?.tokenPath,
                value: payload?.value,
                scope: payload?.scope,
                themeId: payload?.themeId,
                variantId: payload?.variantId,
            },
        });

    const onSetTokenValue = (payload) =>
        dispatch()?.({
            type: EventTypes.TOKEN_SET,
            payload: {
                tokenPath: payload?.tokenPath,
                value: payload?.value,
                scope: payload?.scope,
                themeId: payload?.themeId,
                variantId: payload?.variantId,
            },
        });

    const onDeleteToken = (payload) =>
        dispatch()?.({
            type: EventTypes.TOKEN_DELETE,
            payload: {
                tokenPath: payload?.tokenPath,
                scope: payload?.scope,
                themeId: payload?.themeId,
                variantId: payload?.variantId,
            },
        });

    const onSetTokenAlias = (payload) =>
        dispatch()?.({
            type: EventTypes.TOKEN_ALIAS_SET,
            payload: {
                tokenPath: payload?.tokenPath,
                targetPath: payload?.targetPath,
                scope: payload?.scope,
                themeId: payload?.themeId,
                variantId: payload?.variantId,
            },
        });

    const onCreateTheme = (payload) =>
        dispatch()?.({
            type: EventTypes.THEME_CREATE,
            payload: {
                theme: payload?.theme,
            },
        });

    const onSwitchTheme = (payload) =>
        dispatch()?.({
            type: EventTypes.THEME_SWITCH,
            payload: {
                themeId: payload?.themeId,
            },
        });

    const onTagTokenVersion = (payload) =>
        dispatch()?.({
            type: EventTypes.TOKEN_VERSION_TAG,
            payload: {
                versionId: payload?.versionId,
                parentVersionIds: payload?.parentVersionIds ?? (payload?.parentId ? [payload.parentId] : []),
                themeId: payload?.themeId ?? null,
                label: payload?.label ?? null,
                timestamp: payload?.timestamp ?? null,
            },
        });

    const onForkTokenVersion = (payload) =>
        dispatch()?.({
            type: EventTypes.TOKEN_VERSION_FORK,
            payload: {
                versionId: payload?.versionId,
                parentVersionId: payload?.sourceVersionId ?? payload?.parentVersionId ?? payload?.parentId ?? null,
                themeId: payload?.themeId ?? null,
                label: payload?.label ?? null,
                timestamp: payload?.timestamp ?? null,
            },
        });

    const onMergeTokenVersion = (payload) =>
        dispatch()?.({
            type: EventTypes.TOKEN_VERSION_MERGE,
            payload: {
                versionId: payload?.versionId,
                parentVersionIds: payload?.parentVersionIds,
                themeId: payload?.themeId ?? null,
                label: payload?.label ?? null,
                timestamp: payload?.timestamp ?? null,
            },
        });

    const onRollbackTokenVersion = (payload) =>
        dispatch()?.({
            type: EventTypes.TOKEN_VERSION_ROLLBACK,
            payload: {
                rollbackTargetId: payload?.rollbackTargetId ?? null,
            },
        });

    if (!registered) {
        canvasBus.on(TOKEN_AUTHORING_INTENTS.createToken, onCreateToken);
        canvasBus.on(TOKEN_AUTHORING_INTENTS.setTokenValue, onSetTokenValue);
        canvasBus.on(TOKEN_AUTHORING_INTENTS.deleteToken, onDeleteToken);
        canvasBus.on(TOKEN_AUTHORING_INTENTS.setTokenAlias, onSetTokenAlias);
        canvasBus.on(TOKEN_AUTHORING_INTENTS.createTheme, onCreateTheme);
        canvasBus.on(TOKEN_AUTHORING_INTENTS.switchTheme, onSwitchTheme);
        canvasBus.on(TOKEN_AUTHORING_INTENTS.tagTokenVersion, onTagTokenVersion);
        canvasBus.on(TOKEN_AUTHORING_INTENTS.forkTokenVersion, onForkTokenVersion);
        canvasBus.on(TOKEN_AUTHORING_INTENTS.mergeTokenVersion, onMergeTokenVersion);
        canvasBus.on(TOKEN_AUTHORING_INTENTS.rollbackTokenVersion, onRollbackTokenVersion);
        registered = true;
    }

    return () => {
        activeRegistrations = Math.max(0, activeRegistrations - 1);
        if (activeRegistrations === 0) {
            canvasBus.off(TOKEN_AUTHORING_INTENTS.createToken, onCreateToken);
            canvasBus.off(TOKEN_AUTHORING_INTENTS.setTokenValue, onSetTokenValue);
            canvasBus.off(TOKEN_AUTHORING_INTENTS.deleteToken, onDeleteToken);
            canvasBus.off(TOKEN_AUTHORING_INTENTS.setTokenAlias, onSetTokenAlias);
            canvasBus.off(TOKEN_AUTHORING_INTENTS.createTheme, onCreateTheme);
            canvasBus.off(TOKEN_AUTHORING_INTENTS.switchTheme, onSwitchTheme);
            canvasBus.off(TOKEN_AUTHORING_INTENTS.tagTokenVersion, onTagTokenVersion);
            canvasBus.off(TOKEN_AUTHORING_INTENTS.forkTokenVersion, onForkTokenVersion);
            canvasBus.off(TOKEN_AUTHORING_INTENTS.mergeTokenVersion, onMergeTokenVersion);
            canvasBus.off(TOKEN_AUTHORING_INTENTS.rollbackTokenVersion, onRollbackTokenVersion);
            activeDispatcher = null;
            registered = false;
        }
    };
}
