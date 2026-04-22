import { useMemo } from 'react';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';

export const TOKEN_AUTHORING_INTENTS = Object.freeze({
    createToken: 'intent.system.token.create',
    setTokenValue: 'intent.system.token.set',
    deleteToken: 'intent.system.token.delete',
    setTokenAlias: 'intent.system.token.alias.set',
    createTheme: 'intent.system.theme.create',
    switchTheme: 'intent.system.theme.switch',
    tagTokenVersion: 'intent.system.token-version.tag',
    forkTokenVersion: 'intent.system.token-version.fork',
    mergeTokenVersion: 'intent.system.token-version.merge',
    rollbackTokenVersion: 'intent.system.token-version.rollback',
});

function emitIntent(type, payload, validate) {
    if (!validate(payload)) return;
    canvasBus.emit(type, payload);
}

function hasTokenPath(value) {
    return typeof value?.tokenPath === 'string' && value.tokenPath.length > 0;
}

export function createTokenCommand(payload) {
    emitIntent(
        TOKEN_AUTHORING_INTENTS.createToken,
        payload,
        (value) => hasTokenPath(value),
    );
}

export function setTokenValueCommand(payload) {
    emitIntent(
        TOKEN_AUTHORING_INTENTS.setTokenValue,
        payload,
        (value) => hasTokenPath(value),
    );
}

export function deleteTokenCommand(payload) {
    emitIntent(
        TOKEN_AUTHORING_INTENTS.deleteToken,
        payload,
        (value) => hasTokenPath(value),
    );
}

export function setTokenAliasCommand(payload) {
    emitIntent(
        TOKEN_AUTHORING_INTENTS.setTokenAlias,
        payload,
        (value) => hasTokenPath(value) && typeof value?.targetPath === 'string' && value.targetPath.length > 0,
    );
}

export function createThemeCommand(payload) {
    emitIntent(
        TOKEN_AUTHORING_INTENTS.createTheme,
        payload,
        (value) => Boolean(value?.theme?.id),
    );
}

export function switchThemeCommand(payload) {
    emitIntent(
        TOKEN_AUTHORING_INTENTS.switchTheme,
        payload,
        (value) => typeof value?.themeId === 'string' && value.themeId.length > 0,
    );
}

export function tagTokenVersionCommand(payload) {
    emitIntent(
        TOKEN_AUTHORING_INTENTS.tagTokenVersion,
        payload,
        (value) => typeof value?.versionId === 'string' && value.versionId.length > 0,
    );
}

export function forkTokenVersionCommand(payload) {
    emitIntent(
        TOKEN_AUTHORING_INTENTS.forkTokenVersion,
        payload,
        (value) =>
            typeof value?.versionId === 'string' &&
            value.versionId.length > 0 &&
            typeof (value?.sourceVersionId ?? value?.parentId) === 'string' &&
            (value.sourceVersionId ?? value.parentId).length > 0,
    );
}

export function mergeTokenVersionCommand(payload) {
    emitIntent(
        TOKEN_AUTHORING_INTENTS.mergeTokenVersion,
        payload,
        (value) =>
            typeof value?.versionId === 'string' &&
            value.versionId.length > 0 &&
            Array.isArray(value?.parentVersionIds) &&
            value.parentVersionIds.filter((parentId) => typeof parentId === 'string' && parentId.length > 0).length >= 2,
    );
}

export function rollbackTokenVersionCommand(payload) {
    emitIntent(
        TOKEN_AUTHORING_INTENTS.rollbackTokenVersion,
        payload,
        (value) =>
            typeof value?.rollbackTargetId === 'string' &&
            value.rollbackTargetId.length > 0,
    );
}

export function createTokenAuthoringCommandLayer() {
    const layer = {
        createToken: createTokenCommand,
        setTokenValue: setTokenValueCommand,
        updateToken: setTokenValueCommand,
        deleteToken: deleteTokenCommand,
        setTokenAlias: setTokenAliasCommand,
        createTheme: createThemeCommand,
        switchTheme: switchThemeCommand,
        tagTokenVersion: tagTokenVersionCommand,
        forkTokenVersion: forkTokenVersionCommand,
        mergeTokenVersion: mergeTokenVersionCommand,
        rollbackTokenVersion: rollbackTokenVersionCommand,
        tagVersion: tagTokenVersionCommand,
        forkVersion: forkTokenVersionCommand,
        mergeVersion: mergeTokenVersionCommand,
        rollbackVersion: rollbackTokenVersionCommand,
    };

    return Object.freeze(layer);
}

export function useTokenAuthoringIntent() {
    return useMemo(() => createTokenAuthoringCommandLayer(), []);
}
