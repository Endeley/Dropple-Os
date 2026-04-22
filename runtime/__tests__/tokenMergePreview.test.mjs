import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import {
    hashProjectedTokenMergePreview,
    projectTokenMergePreview,
} from '@/runtime/tokens/projectTokenMergePreview.js';
import { selectActiveTokenMergePreview } from '@/runtime/tokens/selectActiveTokenMergePreview.js';
import { appendTokenVersion } from '@/runtime/tokens/tokenVersionGraph.js';

function createMergeGraph() {
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

function createPreviewState() {
    return {
        document: {
            tokenVersions: createMergeGraph(),
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

test('token merge preview classifies divergent edits and incoming changes deterministically', () => {
    const state = createPreviewState();
    const preview = projectTokenMergePreview({
        tokenVersionGraph: state.document.tokenVersions,
        document: state.document,
        events: state.events,
        leftVersionId: 'v2',
        rightVersionId: 'v3',
    });

    assert.equal(preview.commonAncestorId, 'v1');
    assert.deepEqual(
        preview.incomingChanges.map((entry) => entry.entityKey),
        ['color.secondary'],
    );
    assert.deepEqual(
        preview.overlappingChanges.map((entry) => entry.entityKey),
        ['color.primary'],
    );
    assert.deepEqual(
        preview.conflicts.map((entry) => entry.entityKey),
        ['color.primary'],
    );
    assert.deepEqual(
        preview.autoMergeable.map((entry) => entry.entityKey),
        ['color.secondary'],
    );
    assert.deepEqual(preview.impactSummary, {
        breaking: 0,
        additive: 1,
        cosmetic: 1,
    });
});

test('token merge preview is stable under storage reordering', () => {
    const state = createPreviewState();
    const graph = state.document.tokenVersions;
    const reorderedGraph = {
        ...graph,
        entries: {
            v3: graph.entries.v3,
            v1: graph.entries.v1,
            v2: graph.entries.v2,
        },
    };

    const projected = projectTokenMergePreview({
        tokenVersionGraph: graph,
        document: state.document,
        events: state.events,
        leftVersionId: 'v2',
        rightVersionId: 'v3',
    });
    const reordered = projectTokenMergePreview({
        tokenVersionGraph: reorderedGraph,
        document: {
            ...state.document,
            tokenVersions: reorderedGraph,
        },
        events: state.events,
        leftVersionId: 'v2',
        rightVersionId: 'v3',
    });

    assert.deepEqual(reordered, projected);
    assert.equal(hashProjectedTokenMergePreview(reordered), hashProjectedTokenMergePreview(projected));
});

test('token merge preview returns no conflicts for identical branches and does not mutate truth', () => {
    const state = createPreviewState();
    const before = JSON.stringify(state);

    const preview = selectActiveTokenMergePreview(state, {
        leftVersionId: 'v2',
        rightVersionId: 'v2',
    });

    assert.deepEqual(preview.conflicts, []);
    assert.equal(JSON.stringify(state), before);
});
