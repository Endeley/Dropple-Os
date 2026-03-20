import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveWorkspaceContext } from '@/platform/workspaces/resolveWorkspaceContext.js';

test('resolveWorkspaceContext resolves canonical workspace and mode', () => {
    const context = resolveWorkspaceContext({
        workspace: 'media',
        mode: 'podcast',
    });

    assert.deepEqual(context, {
        workspace: 'media',
        mode: 'podcast',
        label: 'Media',
        modeLabel: 'Podcast',
        definitionId: 'podcast',
        isLegacy: false,
        legacyId: 'podcast',
    });
});

test('resolveWorkspaceContext resolves legacy workspace ids', () => {
    const context = resolveWorkspaceContext({
        workspace: 'uiux',
    });

    assert.deepEqual(context, {
        workspace: 'design',
        mode: 'uiux',
        label: 'Design',
        modeLabel: 'UI / UX',
        definitionId: 'uiux',
        isLegacy: true,
        legacyId: 'uiux',
    });
});

test('resolveWorkspaceContext falls back safely for unknown ids', () => {
    const context = resolveWorkspaceContext({
        workspace: 'unknown-workspace',
    });

    assert.deepEqual(context, {
        workspace: 'design',
        mode: 'uiux',
        label: 'Design',
        modeLabel: 'UI / UX',
        definitionId: 'uiux',
        isLegacy: false,
        legacyId: null,
    });
});
