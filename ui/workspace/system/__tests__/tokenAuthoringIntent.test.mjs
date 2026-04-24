import test from 'node:test';
import assert from 'node:assert/strict';

import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import {
    TOKEN_AUTHORING_INTENTS,
    createThemeCommand,
    createTokenAuthoringCommandLayer,
    createTokenCommand,
    deleteTokenCommand,
    forkTokenVersionCommand,
    mergeTokenVersionCommand,
    rollbackTokenVersionCommand,
    applyResolvedMergeCommand,
    approveTokenReviewCommand,
    rejectTokenReviewCommand,
    requestTokenReviewChangesCommand,
    setTokenAliasCommand,
    setTokenValueCommand,
    switchThemeCommand,
    tagTokenVersionCommand,
} from '@/ui/workspace/system/tokenAuthoringIntent.js';

test('createTokenAuthoringCommandLayer exposes canonical token authoring commands and aliases', () => {
    const commands = createTokenAuthoringCommandLayer();

    assert.equal(commands.createToken, createTokenCommand);
    assert.equal(commands.setTokenValue, setTokenValueCommand);
    assert.equal(commands.updateToken, setTokenValueCommand);
    assert.equal(commands.deleteToken, deleteTokenCommand);
    assert.equal(commands.setTokenAlias, setTokenAliasCommand);
    assert.equal(commands.createTheme, createThemeCommand);
    assert.equal(commands.switchTheme, switchThemeCommand);
    assert.equal(commands.tagTokenVersion, tagTokenVersionCommand);
    assert.equal(commands.forkTokenVersion, forkTokenVersionCommand);
    assert.equal(commands.mergeTokenVersion, mergeTokenVersionCommand);
    assert.equal(commands.rollbackTokenVersion, rollbackTokenVersionCommand);
    assert.equal(commands.applyResolvedMerge, applyResolvedMergeCommand);
    assert.equal(commands.approveTokenReview, approveTokenReviewCommand);
    assert.equal(commands.rejectTokenReview, rejectTokenReviewCommand);
    assert.equal(commands.requestTokenReviewChanges, requestTokenReviewChangesCommand);
    assert.equal(commands.tagVersion, tagTokenVersionCommand);
    assert.equal(commands.forkVersion, forkTokenVersionCommand);
    assert.equal(commands.mergeVersion, mergeTokenVersionCommand);
    assert.equal(commands.rollbackVersion, rollbackTokenVersionCommand);
    assert.ok(Object.isFrozen(commands));
});

test('token authoring command layer emits canonical system intents on the canvas bus', () => {
    const commands = createTokenAuthoringCommandLayer();
    const received = [];

    const handlers = {
        createToken: (payload) => received.push(['createToken', payload]),
        setTokenValue: (payload) => received.push(['setTokenValue', payload]),
        deleteToken: (payload) => received.push(['deleteToken', payload]),
        setTokenAlias: (payload) => received.push(['setTokenAlias', payload]),
        createTheme: (payload) => received.push(['createTheme', payload]),
        switchTheme: (payload) => received.push(['switchTheme', payload]),
        tagTokenVersion: (payload) => received.push(['tagTokenVersion', payload]),
        forkTokenVersion: (payload) => received.push(['forkTokenVersion', payload]),
        mergeTokenVersion: (payload) => received.push(['mergeTokenVersion', payload]),
        rollbackTokenVersion: (payload) => received.push(['rollbackTokenVersion', payload]),
        applyResolvedMerge: (payload) => received.push(['applyResolvedMerge', payload]),
        approveTokenReview: (payload) => received.push(['approveTokenReview', payload]),
        rejectTokenReview: (payload) => received.push(['rejectTokenReview', payload]),
        requestTokenReviewChanges: (payload) => received.push(['requestTokenReviewChanges', payload]),
    };

    canvasBus.on(TOKEN_AUTHORING_INTENTS.createToken, handlers.createToken);
    canvasBus.on(TOKEN_AUTHORING_INTENTS.setTokenValue, handlers.setTokenValue);
    canvasBus.on(TOKEN_AUTHORING_INTENTS.deleteToken, handlers.deleteToken);
    canvasBus.on(TOKEN_AUTHORING_INTENTS.setTokenAlias, handlers.setTokenAlias);
    canvasBus.on(TOKEN_AUTHORING_INTENTS.createTheme, handlers.createTheme);
    canvasBus.on(TOKEN_AUTHORING_INTENTS.switchTheme, handlers.switchTheme);
    canvasBus.on(TOKEN_AUTHORING_INTENTS.tagTokenVersion, handlers.tagTokenVersion);
    canvasBus.on(TOKEN_AUTHORING_INTENTS.forkTokenVersion, handlers.forkTokenVersion);
    canvasBus.on(TOKEN_AUTHORING_INTENTS.mergeTokenVersion, handlers.mergeTokenVersion);
    canvasBus.on(TOKEN_AUTHORING_INTENTS.rollbackTokenVersion, handlers.rollbackTokenVersion);
    canvasBus.on(TOKEN_AUTHORING_INTENTS.applyResolvedMerge, handlers.applyResolvedMerge);
    canvasBus.on(TOKEN_AUTHORING_INTENTS.approveTokenReview, handlers.approveTokenReview);
    canvasBus.on(TOKEN_AUTHORING_INTENTS.rejectTokenReview, handlers.rejectTokenReview);
    canvasBus.on(TOKEN_AUTHORING_INTENTS.requestTokenReviewChanges, handlers.requestTokenReviewChanges);

    try {
        commands.createToken({ tokenPath: 'color.brand', value: '#ff0000', scope: 'global' });
        commands.setTokenValue({ tokenPath: 'color.brand', value: '#00ff00', scope: 'global' });
        commands.deleteToken({ tokenPath: 'color.brand', scope: 'global' });
        commands.setTokenAlias({ tokenPath: 'color.accent', targetPath: 'color.primary', scope: 'global' });
        commands.createTheme({ theme: { id: 'dark', label: 'Dark' } });
        commands.switchTheme({ themeId: 'dark' });
        commands.tagTokenVersion({ versionId: 'v1', label: 'Initial' });
        commands.forkTokenVersion({ versionId: 'v2', sourceVersionId: 'v1', label: 'Fork' });
        commands.mergeTokenVersion({ versionId: 'v3', parentVersionIds: ['v2', 'v1'], label: 'Merge' });
        commands.rollbackTokenVersion({ rollbackTargetId: 'v1', label: 'Rollback' });
        commands.applyResolvedMerge({
            versionId: 'v4',
            parentVersionIds: ['v3', 'v2'],
            unresolvedCount: 0,
        });
        commands.approveTokenReview({ reviewId: 'review-v4', reviewerId: 'qa' });
        commands.rejectTokenReview({ reviewId: 'review-v4', reviewerId: 'qa' });
        commands.requestTokenReviewChanges({ reviewId: 'review-v4', reviewerId: 'qa' });
    } finally {
        canvasBus.off(TOKEN_AUTHORING_INTENTS.createToken, handlers.createToken);
        canvasBus.off(TOKEN_AUTHORING_INTENTS.setTokenValue, handlers.setTokenValue);
        canvasBus.off(TOKEN_AUTHORING_INTENTS.deleteToken, handlers.deleteToken);
        canvasBus.off(TOKEN_AUTHORING_INTENTS.setTokenAlias, handlers.setTokenAlias);
        canvasBus.off(TOKEN_AUTHORING_INTENTS.createTheme, handlers.createTheme);
        canvasBus.off(TOKEN_AUTHORING_INTENTS.switchTheme, handlers.switchTheme);
        canvasBus.off(TOKEN_AUTHORING_INTENTS.tagTokenVersion, handlers.tagTokenVersion);
        canvasBus.off(TOKEN_AUTHORING_INTENTS.forkTokenVersion, handlers.forkTokenVersion);
        canvasBus.off(TOKEN_AUTHORING_INTENTS.mergeTokenVersion, handlers.mergeTokenVersion);
        canvasBus.off(TOKEN_AUTHORING_INTENTS.rollbackTokenVersion, handlers.rollbackTokenVersion);
        canvasBus.off(TOKEN_AUTHORING_INTENTS.applyResolvedMerge, handlers.applyResolvedMerge);
        canvasBus.off(TOKEN_AUTHORING_INTENTS.approveTokenReview, handlers.approveTokenReview);
        canvasBus.off(TOKEN_AUTHORING_INTENTS.rejectTokenReview, handlers.rejectTokenReview);
        canvasBus.off(TOKEN_AUTHORING_INTENTS.requestTokenReviewChanges, handlers.requestTokenReviewChanges);
    }

    assert.deepEqual(received, [
        ['createToken', { tokenPath: 'color.brand', value: '#ff0000', scope: 'global' }],
        ['setTokenValue', { tokenPath: 'color.brand', value: '#00ff00', scope: 'global' }],
        ['deleteToken', { tokenPath: 'color.brand', scope: 'global' }],
        ['setTokenAlias', { tokenPath: 'color.accent', targetPath: 'color.primary', scope: 'global' }],
        ['createTheme', { theme: { id: 'dark', label: 'Dark' } }],
        ['switchTheme', { themeId: 'dark' }],
        ['tagTokenVersion', { versionId: 'v1', label: 'Initial' }],
        ['forkTokenVersion', { versionId: 'v2', sourceVersionId: 'v1', label: 'Fork' }],
        ['mergeTokenVersion', { versionId: 'v3', parentVersionIds: ['v2', 'v1'], label: 'Merge' }],
        ['rollbackTokenVersion', { rollbackTargetId: 'v1', label: 'Rollback' }],
        ['applyResolvedMerge', { versionId: 'v4', parentVersionIds: ['v3', 'v2'], unresolvedCount: 0 }],
        ['approveTokenReview', { reviewId: 'review-v4', reviewerId: 'qa' }],
        ['rejectTokenReview', { reviewId: 'review-v4', reviewerId: 'qa' }],
        ['requestTokenReviewChanges', { reviewId: 'review-v4', reviewerId: 'qa' }],
    ]);
});
