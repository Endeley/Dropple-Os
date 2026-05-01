import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveWorkspaceContext } from '@/platform/workspaces/resolveWorkspaceContext.js';
import { listMediaWorkspaceModes, resolveMediaWorkspaceMode } from '@/platform/workspaces/mediaWorkspace.js';

test('resolveWorkspaceContext resolves canonical workspace and mode', () => {
    const context = resolveWorkspaceContext({
        workspace: 'media',
        mode: 'podcast',
    });

    assert.deepEqual(context, {
        workspaceId: 'media',
        modeId: 'podcast',
        workspace: 'media',
        mode: 'podcast',
        label: 'Media',
        modeLabel: 'Podcast',
        definitionId: 'podcast',
        isLegacy: false,
        legacyId: 'podcast',
        source: 'legacy-mode-compat',
    });
});

test('resolveWorkspaceContext resolves legacy workspace ids', () => {
    const context = resolveWorkspaceContext({
        workspace: 'uiux',
    });

    assert.deepEqual(context, {
        workspaceId: 'design',
        modeId: 'uiux',
        workspace: 'design',
        mode: 'uiux',
        label: 'Design',
        modeLabel: 'UI / UX',
        definitionId: 'uiux',
        isLegacy: false,
        legacyId: null,
        source: 'mode-direct',
    });
});

test('resolveWorkspaceContext resolves canonical audio to the preserved podcast definition payload', () => {
    const context = resolveWorkspaceContext({
        workspace: 'media',
        mode: 'audio',
    });

    assert.deepEqual(context, {
        workspaceId: 'media',
        modeId: 'audio',
        workspace: 'media',
        mode: 'audio',
        label: 'Media',
        modeLabel: 'Audio',
        definitionId: 'podcast',
        isLegacy: false,
        legacyId: null,
        source: 'canonical',
    });
});

test('media workspace helpers canonicalize podcast compatibility to audio', () => {
    assert.equal(resolveMediaWorkspaceMode('podcast'), 'audio');
    assert.deepEqual(listMediaWorkspaceModes(), [
        { id: 'animation', label: 'Animation' },
        { id: 'video', label: 'Video' },
        { id: 'audio', label: 'Audio' },
    ]);
});

test('resolveWorkspaceContext resolves canonical audio from direct workspace route segments', () => {
    const context = resolveWorkspaceContext({
        workspace: 'audio',
    });

    assert.deepEqual(context, {
        workspaceId: 'media',
        modeId: 'audio',
        workspace: 'media',
        mode: 'audio',
        label: 'Media',
        modeLabel: 'Audio',
        definitionId: 'podcast',
        isLegacy: false,
        legacyId: null,
        source: 'mode-direct',
    });
});

test('resolveWorkspaceContext resolves canonical automation to the preserved conversion payload', () => {
    const context = resolveWorkspaceContext({
        workspace: 'automation',
    });

    assert.deepEqual(context, {
        workspaceId: 'build',
        modeId: 'automation',
        workspace: 'build',
        mode: 'automation',
        label: 'Build',
        modeLabel: 'Automation',
        definitionId: 'conversion',
        isLegacy: false,
        legacyId: null,
        source: 'mode-direct',
    });
});

test('resolveWorkspaceContext preserves conversion as a compatibility surface under automation', () => {
    const context = resolveWorkspaceContext({
        workspace: 'conversion',
    });

    assert.deepEqual(context, {
        workspaceId: 'build',
        modeId: 'conversion',
        workspace: 'build',
        mode: 'conversion',
        label: 'Build',
        modeLabel: 'Conversion',
        definitionId: 'conversion',
        isLegacy: true,
        legacyId: 'conversion',
        source: 'legacy-alias',
    });
});

test('resolveWorkspaceContext preserves ai-build as a compatibility surface under automation', () => {
    const context = resolveWorkspaceContext({
        workspace: 'build',
        mode: 'ai-build',
    });

    assert.deepEqual(context, {
        workspaceId: 'build',
        modeId: 'ai-build',
        workspace: 'build',
        mode: 'ai-build',
        label: 'Build',
        modeLabel: 'AI Build',
        definitionId: 'ai',
        isLegacy: false,
        legacyId: 'ai-build',
        source: 'legacy-mode-compat',
    });
});

test('resolveWorkspaceContext resolves canonical knowledge without forcing legacy learning identity', () => {
    const context = resolveWorkspaceContext({
        workspace: 'knowledge',
    });

    assert.deepEqual(context, {
        workspaceId: 'collaborate',
        modeId: 'knowledge',
        workspace: 'collaborate',
        mode: 'knowledge',
        label: 'Collaborate',
        modeLabel: 'Knowledge',
        definitionId: 'education',
        isLegacy: false,
        legacyId: null,
        source: 'mode-direct',
    });
});

test('resolveWorkspaceContext preserves education as a guided compatibility surface under knowledge', () => {
    const context = resolveWorkspaceContext({
        workspace: 'education',
    });

    assert.deepEqual(context, {
        workspaceId: 'collaborate',
        modeId: 'education',
        workspace: 'collaborate',
        mode: 'education',
        label: 'Collaborate',
        modeLabel: 'Education',
        definitionId: 'education',
        isLegacy: true,
        legacyId: 'education',
        source: 'legacy-alias',
    });
});

test('resolveWorkspaceContext preserves themes and variants as compatibility surfaces under canonical owners', () => {
    assert.deepEqual(
        resolveWorkspaceContext({
            workspace: 'themes',
        }),
        {
            workspaceId: 'system',
            modeId: 'themes',
            workspace: 'system',
            mode: 'themes',
            label: 'System',
            modeLabel: 'Themes',
            definitionId: 'material',
            isLegacy: true,
            legacyId: 'themes',
            source: 'legacy-alias',
        },
    );

    assert.deepEqual(
        resolveWorkspaceContext({
            workspace: 'variants',
        }),
        {
            workspaceId: 'system',
            modeId: 'variants',
            workspace: 'system',
            mode: 'variants',
            label: 'System',
            modeLabel: 'Variants',
            definitionId: 'material',
            isLegacy: true,
            legacyId: 'variants',
            source: 'legacy-alias',
        },
    );

});

test('resolveWorkspaceContext falls back safely for unknown ids', () => {
    const context = resolveWorkspaceContext({
        workspace: 'unknown-workspace',
    });

    assert.deepEqual(context, {
        workspaceId: 'design',
        modeId: 'uiux',
        workspace: 'design',
        mode: 'uiux',
        label: 'Design',
        modeLabel: 'UI / UX',
        definitionId: 'uiux',
        isLegacy: false,
        legacyId: null,
        source: 'fallback',
    });
});
