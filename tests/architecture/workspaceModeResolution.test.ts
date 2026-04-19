import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveCanonicalWorkspaceContext, listWorkspaceAliases, WORKSPACE_ALIASES } from '@/platform/workspaces/modeResolution.js';

test('resolves canonical workspace and mode directly', () => {
    const resolved = resolveCanonicalWorkspaceContext({
        workspaceId: 'design',
        modeId: 'uiux',
    });

    assert.deepEqual(
        resolved,
        Object.freeze({
            workspaceId: 'design',
            modeId: 'uiux',
            definitionId: 'uiux',
            source: 'canonical',
        }),
    );
});

test('resolves canonical workspace to its default mode', () => {
    const resolved = resolveCanonicalWorkspaceContext({
        workspaceId: 'media',
    });

    assert.deepEqual(
        resolved,
        Object.freeze({
            workspaceId: 'media',
            modeId: 'animation',
            definitionId: 'animation',
            source: 'workspace-default',
        }),
    );
});

test('resolves canonical mode directly to its owning workspace', () => {
    const resolved = resolveCanonicalWorkspaceContext({
        modeId: 'review',
    });

    assert.deepEqual(
        resolved,
        Object.freeze({
            workspaceId: 'collaborate',
            modeId: 'review',
            definitionId: 'review',
            source: 'mode-direct',
        }),
    );
});

test('resolves legacy workspace aliases into canonical workspace and mode', () => {
    const resolved = resolveCanonicalWorkspaceContext({
        workspaceId: 'graphic',
    });

    assert.deepEqual(
        resolved,
        Object.freeze({
            workspaceId: 'design',
            modeId: 'graphic',
            definitionId: 'graphic',
            source: 'legacy-alias',
        }),
    );
});

test('resolves legacy mode aliases into canonical workspace and mode', () => {
    const resolved = resolveCanonicalWorkspaceContext({
        modeId: 'animation',
    });

    assert.deepEqual(
        resolved,
        Object.freeze({
            workspaceId: 'media',
            modeId: 'animation',
            definitionId: 'animation',
            source: 'mode-direct',
        }),
    );
});

test('falls back to constitutional default when resolution input is unknown', () => {
    const resolved = resolveCanonicalWorkspaceContext({
        workspaceId: 'unknown-workspace',
        modeId: 'unknown-mode',
    });

    assert.deepEqual(
        resolved,
        Object.freeze({
            workspaceId: 'design',
            modeId: 'uiux',
            definitionId: 'uiux',
            source: 'fallback',
        }),
    );
});

test('throws when canonical mode does not belong to the provided canonical workspace', () => {
    assert.throws(
        () =>
            resolveCanonicalWorkspaceContext({
                workspaceId: 'design',
                modeId: 'animation',
            }),
        /does not belong to workspace/,
    );
});

test('workspace aliases list is deterministic', () => {
    const ids = listWorkspaceAliases();

    assert.deepEqual(ids, Object.keys(WORKSPACE_ALIASES).sort());
});
