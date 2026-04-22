import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import { selectVersionComparison } from '@/runtime/tokens/selectVersionComparison.js';
import { appendTokenVersion } from '@/runtime/tokens/tokenVersionGraph.js';

function createComparisonGraph() {
    return appendTokenVersion(
        appendTokenVersion(
            appendTokenVersion(undefined, {
                id: 'v1',
                label: 'Initial',
                timestamp: 1,
            }),
            {
                id: 'v2',
                label: 'Left',
                parentVersionIds: ['v1'],
                timestamp: 2,
                operation: 'fork',
            },
        ),
        {
            id: 'v3',
            label: 'Right',
            parentVersionIds: ['v1'],
            timestamp: 3,
            operation: 'fork',
        },
    );
}

function createComparisonState(activeVersionId = 'v3') {
    const tokenVersions = {
        ...createComparisonGraph(),
        activeVersionId,
    };

    return {
        document: {
            tokenVersions,
            tokens: {},
            themes: {
                activeThemeId: null,
                byId: {},
                order: [],
            },
        },
        events: [
            {
                type: EventTypes.TOKEN_SET,
                payload: {
                    tokenPath: 'color.primary',
                    value: '#111111',
                    scope: 'global',
                },
            },
            {
                type: EventTypes.TOKEN_VERSION_TAG,
                payload: {
                    versionId: 'v1',
                    label: 'Initial',
                    timestamp: 1,
                },
            },
            {
                type: EventTypes.TOKEN_SET,
                payload: {
                    tokenPath: 'color.primary',
                    value: '#222222',
                    scope: 'global',
                },
            },
            {
                type: EventTypes.TOKEN_VERSION_FORK,
                payload: {
                    versionId: 'v2',
                    parentVersionId: 'v1',
                    label: 'Left',
                    timestamp: 2,
                },
            },
            {
                type: EventTypes.TOKEN_VERSION_ROLLBACK,
                payload: {
                    rollbackTargetId: 'v1',
                },
            },
            {
                type: EventTypes.TOKEN_SET,
                payload: {
                    tokenPath: 'color.primary',
                    value: '#333333',
                    scope: 'global',
                },
            },
            {
                type: EventTypes.TOKEN_SET,
                payload: {
                    tokenPath: 'color.secondary',
                    value: '#444444',
                    scope: 'global',
                },
            },
            {
                type: EventTypes.TOKEN_VERSION_FORK,
                payload: {
                    versionId: 'v3',
                    parentVersionId: 'v1',
                    label: 'Right',
                    timestamp: 3,
                },
            },
        ],
    };
}

test('version comparison resolves ancestor vs descendant deterministically', () => {
    const comparison = selectVersionComparison(createComparisonState(), {
        leftVersionId: 'v1',
        rightVersionId: 'v2',
    });

    assert.equal(comparison.relationship, 'ancestor');
    assert.equal(comparison.commonAncestorId, 'v1');
    assert.equal(comparison.changedValues.length, 1);
});

test('version comparison resolves sibling branches and stable common ancestor', () => {
    const comparison = selectVersionComparison(createComparisonState(), {
        leftVersionId: 'v2',
        rightVersionId: 'v3',
    });

    assert.equal(comparison.relationship, 'sibling_branch');
    assert.equal(comparison.commonAncestorId, 'v1');
    assert.equal(comparison.changedValues.length, 1);
    assert.equal(comparison.addedTokens.length, 1);
});

test('version comparison returns an empty diff for identical versions', () => {
    const comparison = selectVersionComparison(createComparisonState(), {
        leftVersionId: 'v2',
        rightVersionId: 'v2',
    });

    assert.equal(comparison.relationship, 'identical');
    assert.deepEqual(comparison.changedValues, []);
    assert.deepEqual(comparison.impactSummary, {
        breaking: 0,
        additive: 0,
        cosmetic: 0,
    });
});

test('version comparison swap is symmetric and independent from active head', () => {
    const leftRight = selectVersionComparison(createComparisonState('v3'), {
        leftVersionId: 'v1',
        rightVersionId: 'v2',
    });
    const rightLeft = selectVersionComparison(createComparisonState('v1'), {
        leftVersionId: 'v2',
        rightVersionId: 'v1',
    });

    assert.equal(leftRight.relationship, 'ancestor');
    assert.equal(rightLeft.relationship, 'descendant');
    assert.equal(leftRight.changedValues[0].from, '#111111');
    assert.equal(leftRight.changedValues[0].to, '#222222');
    assert.equal(rightLeft.changedValues[0].from, '#222222');
    assert.equal(rightLeft.changedValues[0].to, '#111111');
});
