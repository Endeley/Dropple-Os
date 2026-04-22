import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import {
    hashProjectedTokenVersionDiff,
    projectTokenVersionDiff,
} from '@/runtime/tokens/projectTokenVersionDiff.js';
import { selectActiveTokenVersionDiff } from '@/runtime/tokens/selectActiveTokenVersionDiff.js';
import { appendTokenVersion } from '@/runtime/tokens/tokenVersionGraph.js';

function createVersionGraph() {
    return appendTokenVersion(
        appendTokenVersion(undefined, {
            id: 'v1',
            label: 'Initial',
            timestamp: 1,
        }),
        {
            id: 'v2',
            label: 'Second',
            parentVersionIds: ['v1'],
            timestamp: 2,
        },
    );
}

function createDiffState(overrides = {}) {
    return {
        document: {
            tokenVersions: createVersionGraph(),
            tokens: {},
            themes: {
                activeThemeId: 'dark',
                byId: {
                    dark: {
                        id: 'dark',
                        label: 'Dark',
                        parentThemeId: null,
                        tokens: {
                            color: {
                                primary: '#101010',
                            },
                        },
                        variants: {},
                    },
                },
                order: ['dark'],
            },
            ...overrides.document,
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
                type: EventTypes.TOKEN_SET,
                payload: {
                    tokenPath: 'space.sm',
                    value: 8,
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
                type: EventTypes.TOKEN_SET,
                payload: {
                    tokenPath: 'color.secondary',
                    value: '#333333',
                    scope: 'global',
                },
            },
            {
                type: EventTypes.TOKEN_DELETE,
                payload: {
                    tokenPath: 'space.sm',
                    scope: 'global',
                },
            },
            {
                type: EventTypes.TOKEN_ALIAS_SET,
                payload: {
                    tokenPath: 'color.brand',
                    targetPath: 'color.primary',
                    scope: 'global',
                },
            },
            {
                type: EventTypes.THEME_CREATE,
                payload: {
                    theme: {
                        id: 'dark',
                        label: 'Dark',
                        tokens: {
                            color: {
                                primary: '#101010',
                            },
                        },
                    },
                },
            },
            {
                type: EventTypes.THEME_SWITCH,
                payload: {
                    themeId: 'dark',
                },
            },
            {
                type: EventTypes.TOKEN_VERSION_TAG,
                payload: {
                    versionId: 'v2',
                    label: 'Second',
                    themeId: 'dark',
                    parentVersionIds: ['v1'],
                    timestamp: 2,
                },
            },
            ...(overrides.events ?? []),
        ],
    };
}

test('token version diff projects deterministic semantic changes between versions', () => {
    const projected = projectTokenVersionDiff({
        tokenVersionGraph: createVersionGraph(),
        events: createDiffState().events,
        baseVersionId: 'v1',
        compareVersionId: 'v2',
    });

    assert.deepEqual(projected.addedTokens, [
        {
            key: 'color.secondary',
            scope: 'global',
            tokenPath: 'color.secondary',
            themeId: null,
            variantId: null,
            value: '#333333',
        },
        {
            key: 'theme.dark.color.primary',
            scope: 'theme',
            tokenPath: 'color.primary',
            themeId: 'dark',
            variantId: null,
            value: '#101010',
        },
    ]);
    assert.deepEqual(projected.removedTokens, [
        {
            key: 'space.sm',
            scope: 'global',
            tokenPath: 'space.sm',
            themeId: null,
            variantId: null,
            value: 8,
        },
    ]);
    assert.deepEqual(projected.changedValues, [
        {
            key: 'color.primary',
            scope: 'global',
            tokenPath: 'color.primary',
            themeId: null,
            variantId: null,
            from: '#111111',
            to: '#222222',
        },
    ]);
    assert.deepEqual(projected.changedAliases, [
        {
            key: 'color.brand',
            scope: 'global',
            tokenPath: 'color.brand',
            themeId: null,
            variantId: null,
            from: null,
            to: 'color.primary',
        },
    ]);
    assert.deepEqual(projected.changedThemeBindings, [
        {
            type: 'activeTheme',
            from: null,
            to: 'dark',
        },
        {
            type: 'versionTheme',
            from: null,
            to: 'dark',
        },
    ]);
    assert.deepEqual(projected.impactSummary, {
        breaking: 2,
        additive: 2,
        cosmetic: 3,
    });
});

test('token version diff hash stays stable under version storage reordering', () => {
    const baseGraph = createVersionGraph();
    const state = createDiffState({
        document: {
            tokenVersions: {
                ...baseGraph,
                entries: {
                    v2: baseGraph.entries.v2,
                    v1: baseGraph.entries.v1,
                },
            },
        },
    });

    const projected = selectActiveTokenVersionDiff(state, {
        baseVersionId: 'v1',
        compareVersionId: 'v2',
    });
    const reordered = selectActiveTokenVersionDiff(
        {
            ...state,
            document: {
                ...state.document,
                themes: {
                    ...state.document.themes,
                    byId: {
                        dark: state.document.themes.byId.dark,
                    },
                },
            },
        },
        {
            baseVersionId: 'v1',
            compareVersionId: 'v2',
        },
    );

    assert.deepEqual(reordered, projected);
    assert.equal(hashProjectedTokenVersionDiff(reordered), hashProjectedTokenVersionDiff(projected));
});

test('token version diff selector compares selected version against active head by default', () => {
    const projected = selectActiveTokenVersionDiff(createDiffState(), {
        compareVersionId: 'v1',
    });

    assert.equal(projected.baseVersionId, 'v2');
    assert.equal(projected.compareVersionId, 'v1');
    assert.equal(projected.changedValues.length, 1);
});
