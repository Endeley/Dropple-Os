import test from 'node:test';
import assert from 'node:assert/strict';

import {
    resolveCanonicalWorkspaceContext,
    resolveCanonicalWorkspaceOverlayContext,
    resolveModeWithOverlay,
    listWorkspaceAliases,
    WORKSPACE_ALIASES,
} from '@/platform/workspaces/modeResolution.js';
import {
    getLegacyWorkspaceEntry,
    listLegacyWorkspaceEntryIds,
    LEGACY_WORKSPACE_MAP,
} from '@/platform/workspaces/legacyMapping.js';

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
            source: 'mode-direct',
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

test('overlay-aware mode resolution preserves canonical owner and overlay id for collapsed legacy modes', () => {
    const resolved = resolveModeWithOverlay('branding');

    assert.deepEqual(
        resolved,
        Object.freeze({
            originalModeId: 'branding',
            canonicalModeId: 'graphic',
            workspaceId: 'design',
            overlayId: 'brand-systems',
            overlayClass: 'capability',
            source: 'overlay',
        }),
    );
});

test('overlay-aware mode resolution follows legacy aliases into payload overlays', () => {
    const resolved = resolveModeWithOverlay('ai');

    assert.deepEqual(
        resolved,
        Object.freeze({
            originalModeId: 'ai',
            canonicalModeId: 'automation',
            workspaceId: 'build',
            overlayId: 'ai-systems',
            overlayClass: 'payload',
            source: 'overlay-alias',
        }),
    );
});

test('overlay-aware mode resolution keeps systems and operations overlays owned by build automation', () => {
    assert.deepEqual(
        resolveModeWithOverlay('systems-engineering'),
        Object.freeze({
            originalModeId: 'systems-engineering',
            canonicalModeId: 'automation',
            workspaceId: 'build',
            overlayId: 'systems-engineering',
            overlayClass: 'payload',
            source: 'overlay',
        }),
    );

    assert.deepEqual(
        resolveModeWithOverlay('enterprise-operations'),
        Object.freeze({
            originalModeId: 'enterprise-operations',
            canonicalModeId: 'automation',
            workspaceId: 'build',
            overlayId: 'enterprise-operations',
            overlayClass: 'payload',
            source: 'overlay',
        }),
    );
});

test('overlay workspace context keeps current routing mode while exposing future canonical overlay identity', () => {
    const resolved = resolveCanonicalWorkspaceOverlayContext({
        workspaceId: 'branding',
    });

    assert.deepEqual(
        resolved,
        Object.freeze({
            workspaceId: 'design',
            modeId: 'branding',
            definitionId: 'branding',
            source: 'legacy-alias',
            originalModeId: 'branding',
            canonicalModeId: 'graphic',
            overlayId: 'brand-systems',
            overlayClass: 'capability',
        }),
    );
});

test('legacy workspace map preserves old entry ids while carrying canonical overlay meaning', () => {
    const branding = getLegacyWorkspaceEntry('branding');
    const podcast = getLegacyWorkspaceEntry('podcast');
    const versioning = getLegacyWorkspaceEntry('versioning');

    assert.deepEqual(
        branding,
        Object.freeze({
            workspace: 'design',
            mode: 'branding',
            definitionId: 'branding',
            originalModeId: 'branding',
            canonicalModeId: 'graphic',
            overlayId: 'brand-systems',
            overlayClass: 'capability',
        }),
    );

    assert.deepEqual(
        podcast,
        Object.freeze({
            workspace: 'media',
            mode: 'podcast',
            definitionId: 'podcast',
            originalModeId: 'podcast',
            canonicalModeId: 'audio',
            overlayId: 'podcast',
            overlayClass: 'payload',
        }),
    );

    assert.deepEqual(
        versioning,
        Object.freeze({
            workspace: 'system',
            mode: 'versioning',
            definitionId: 'versioning',
            originalModeId: 'versioning',
            canonicalModeId: 'governance',
            overlayId: 'versioning',
            overlayClass: 'payload',
        }),
    );
});

test('legacy workspace entry ids remain deterministic', () => {
    assert.deepEqual(listLegacyWorkspaceEntryIds(), Object.keys(LEGACY_WORKSPACE_MAP).sort());
});
