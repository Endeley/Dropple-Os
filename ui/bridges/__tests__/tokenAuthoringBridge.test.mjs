import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { registerTokenAuthoringBridge } from '@/ui/bridges/tokenAuthoringBridge.js';
import { TOKEN_AUTHORING_INTENTS } from '@/ui/workspace/system/tokenAuthoringIntent.js';

function createDispatcher(target) {
    return {
        dispatch(event) {
            target.push(event);
        },
    };
}

test('token authoring bridge rebinds to the latest dispatcher for canonical system intents', () => {
    const staleDispatched = [];
    const dispatched = [];

    const cleanupStale = registerTokenAuthoringBridge(createDispatcher(staleDispatched));
    const cleanupActive = registerTokenAuthoringBridge(createDispatcher(dispatched));

    try {
        canvasBus.emit(TOKEN_AUTHORING_INTENTS.createToken, {
            tokenPath: 'color.brand',
            value: '#ff0000',
            scope: 'global',
        });
        canvasBus.emit(TOKEN_AUTHORING_INTENTS.setTokenValue, {
            tokenPath: 'color.brand',
            value: '#00ff00',
            scope: 'global',
        });
        canvasBus.emit(TOKEN_AUTHORING_INTENTS.deleteToken, {
            tokenPath: 'color.brand',
            scope: 'global',
        });
        canvasBus.emit(TOKEN_AUTHORING_INTENTS.setTokenAlias, {
            tokenPath: 'color.accent',
            targetPath: 'color.primary',
            scope: 'global',
        });
        canvasBus.emit(TOKEN_AUTHORING_INTENTS.createTheme, {
            theme: { id: 'dark', label: 'Dark' },
        });
        canvasBus.emit(TOKEN_AUTHORING_INTENTS.switchTheme, {
            themeId: 'dark',
        });
        canvasBus.emit(TOKEN_AUTHORING_INTENTS.tagTokenVersion, {
            versionId: 'v1',
            label: 'Initial',
        });
        canvasBus.emit(TOKEN_AUTHORING_INTENTS.forkTokenVersion, {
            versionId: 'v2',
            sourceVersionId: 'v1',
            label: 'Fork',
        });
        canvasBus.emit(TOKEN_AUTHORING_INTENTS.mergeTokenVersion, {
            versionId: 'v3',
            parentVersionIds: ['v2', 'v1'],
            label: 'Merge',
        });
        canvasBus.emit(TOKEN_AUTHORING_INTENTS.rollbackTokenVersion, {
            rollbackTargetId: 'v1',
            label: 'Rollback',
        });
        canvasBus.emit(TOKEN_AUTHORING_INTENTS.applyResolvedMerge, {
            reviewId: 'review-v4',
            versionId: 'v4',
            parentVersionIds: ['v3', 'v2'],
            unresolvedCount: 0,
            label: 'Resolved merge',
        });
        canvasBus.emit(TOKEN_AUTHORING_INTENTS.approveTokenReview, {
            reviewId: 'review-v4',
            reviewerId: 'qa',
        });
        canvasBus.emit(TOKEN_AUTHORING_INTENTS.rejectTokenReview, {
            reviewId: 'review-v4',
            reviewerId: 'qa',
        });
        canvasBus.emit(TOKEN_AUTHORING_INTENTS.requestTokenReviewChanges, {
            reviewId: 'review-v4',
            reviewerId: 'qa',
        });
    } finally {
        cleanupActive?.();
        cleanupStale?.();
    }

    assert.equal(staleDispatched.length, 0);
    assert.deepEqual(dispatched.map((event) => event.type), [
        EventTypes.TOKEN_CREATE,
        EventTypes.TOKEN_SET,
        EventTypes.TOKEN_DELETE,
        EventTypes.TOKEN_ALIAS_SET,
        EventTypes.THEME_CREATE,
        EventTypes.THEME_SWITCH,
        EventTypes.TOKEN_VERSION_TAG,
        EventTypes.TOKEN_VERSION_FORK,
        EventTypes.TOKEN_VERSION_MERGE,
        EventTypes.TOKEN_VERSION_ROLLBACK,
        EventTypes.TOKEN_REVIEW_SUBMIT,
        EventTypes.TOKEN_REVIEW_APPROVE,
        EventTypes.TOKEN_REVIEW_REJECT,
        EventTypes.TOKEN_REVIEW_REQUEST_CHANGES,
    ]);
    assert.equal(dispatched[7]?.payload?.parentVersionId, 'v1');
    assert.deepEqual(dispatched[8]?.payload?.parentVersionIds, ['v2', 'v1']);
    assert.equal(dispatched[9]?.payload?.rollbackTargetId, 'v1');
    assert.equal(dispatched[10]?.payload?.reviewId, 'review-v4');
    assert.equal(dispatched[11]?.payload?.reviewId, 'review-v4');
});
