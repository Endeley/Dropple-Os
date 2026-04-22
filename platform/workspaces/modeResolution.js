import {
    CANONICAL_WORKSPACES,
    CANONICAL_MODES,
    getCanonicalWorkspace,
    getCanonicalMode,
    hasCanonicalWorkspace,
    hasCanonicalMode,
    resolveWorkspaceDefaultMode,
} from './canonicalRegistry.js';

import {
    getModeDefinition,
    hasModeDefinition,
    resolveModeDefinitionId,
} from './modeRegistry.js';

/* =========================
   🔒 INTERNAL HELPERS
   ========================= */

function normalizeId(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
}

function assertDefinitionId(modeId) {
    const definitionId = resolveModeDefinitionId(modeId);

    if (!definitionId) {
        throw new Error(
            `[Dropple Constitution] Mode "${modeId}" failed to resolve definitionId`
        );
    }

    return definitionId;
}

/* =========================
   LEGACY ALIASES
   ========================= */

export const WORKSPACE_ALIASES = Object.freeze({
    graphic: Object.freeze({ workspaceId: 'design', modeId: 'graphic' }),
    uiux: Object.freeze({ workspaceId: 'design', modeId: 'uiux' }),
    branding: Object.freeze({ workspaceId: 'design', modeId: 'branding' }),
    icons: Object.freeze({ workspaceId: 'design', modeId: 'icons' }),
    document: Object.freeze({ workspaceId: 'design', modeId: 'document' }),

    media: Object.freeze({ workspaceId: 'media', modeId: 'animation' }),
    animation: Object.freeze({ workspaceId: 'media', modeId: 'animation' }),
    video: Object.freeze({ workspaceId: 'media', modeId: 'video' }),
    podcast: Object.freeze({ workspaceId: 'media', modeId: 'podcast' }),

    dev: Object.freeze({ workspaceId: 'build', modeId: 'application' }),
    conversion: Object.freeze({ workspaceId: 'build', modeId: 'conversion' }),

    material: Object.freeze({ workspaceId: 'system', modeId: 'components' }),
    tokens: Object.freeze({ workspaceId: 'system', modeId: 'tokens' }),
    components: Object.freeze({ workspaceId: 'system', modeId: 'components' }),
    variants: Object.freeze({ workspaceId: 'system', modeId: 'variants' }),
    themes: Object.freeze({ workspaceId: 'system', modeId: 'themes' }),
    versioning: Object.freeze({ workspaceId: 'system', modeId: 'versioning' }),

    review: Object.freeze({ workspaceId: 'collaborate', modeId: 'review' }),
    education: Object.freeze({ workspaceId: 'collaborate', modeId: 'education' }),

    ai: Object.freeze({ workspaceId: 'build', modeId: 'ai-build' }),
    translate: Object.freeze({ workspaceId: 'build', modeId: 'conversion' }),
});

/* =========================
   🔒 RESOLUTION GUARDS
   ========================= */

(function validateWorkspaceAliases() {
    for (const [alias, mapping] of Object.entries(WORKSPACE_ALIASES)) {
        if (!mapping || typeof mapping !== 'object') {
            throw new Error(
                `[Dropple Constitution] Alias "${alias}" must resolve to an object`
            );
        }

        if (!hasCanonicalWorkspace(mapping.workspaceId)) {
            throw new Error(
                `[Dropple Constitution] Alias "${alias}" references unknown workspace "${mapping.workspaceId}"`
            );
        }

        if (!hasCanonicalMode(mapping.modeId)) {
            throw new Error(
                `[Dropple Constitution] Alias "${alias}" references unknown mode "${mapping.modeId}"`
            );
        }

        if (getCanonicalMode(mapping.modeId)?.workspaceId !== mapping.workspaceId) {
            throw new Error(
                `[Dropple Constitution] Alias "${alias}" resolves to mode "${mapping.modeId}" not owned by "${mapping.workspaceId}"`
            );
        }
    }
})();

/* =========================
   PUBLIC HELPERS
   ========================= */

export function hasWorkspaceAlias(entryId) {
    return Boolean(entryId && WORKSPACE_ALIASES[entryId]);
}

export function getWorkspaceAlias(entryId) {
    return hasWorkspaceAlias(entryId)
        ? WORKSPACE_ALIASES[entryId]
        : null;
}

export function resolveModeOwner(modeId) {
    return getCanonicalMode(modeId)?.workspaceId ?? null;
}

/* =========================
   🔑 CANONICAL RESOLUTION
   ========================= */

export function resolveCanonicalWorkspaceContext(input = {}) {
    const rawWorkspace = typeof input === 'string'
        ? normalizeId(input)
        : normalizeId(input.workspaceId ?? input.workspace);

    const rawMode = typeof input === 'object' && input
        ? normalizeId(input.modeId ?? input.mode)
        : null;

    // 1. Canonical workspace + canonical mode
    if (hasCanonicalWorkspace(rawWorkspace) && hasCanonicalMode(rawMode)) {
        const mode = getCanonicalMode(rawMode);

        if (mode.workspaceId !== rawWorkspace) {
            throw new Error(
                `[Dropple Constitution] Mode "${rawMode}" does not belong to workspace "${rawWorkspace}"`
            );
        }

        return Object.freeze({
            workspaceId: rawWorkspace,
            modeId: rawMode,
            definitionId: assertDefinitionId(rawMode),
            source: 'canonical',
        });
    }

    // 2. Canonical workspace only → default mode
    if (hasCanonicalWorkspace(rawWorkspace) && !rawMode) {
        const defaultMode = resolveWorkspaceDefaultMode(rawWorkspace);

        return Object.freeze({
            workspaceId: rawWorkspace,
            modeId: defaultMode,
            definitionId: assertDefinitionId(defaultMode),
            source: 'workspace-default',
        });
    }

    // 3. Canonical mode only
    if (!rawWorkspace && hasCanonicalMode(rawMode)) {
        const workspaceId = resolveModeOwner(rawMode);

        return Object.freeze({
            workspaceId,
            modeId: rawMode,
            definitionId: assertDefinitionId(rawMode),
            source: 'mode-direct',
        });
    }

    // 4. Legacy alias (workspace)
    if (hasWorkspaceAlias(rawWorkspace)) {
        const alias = getWorkspaceAlias(rawWorkspace);

        if (getCanonicalMode(alias.modeId)?.workspaceId !== alias.workspaceId) {
            throw new Error(
                `[Dropple Constitution] Alias "${rawWorkspace}" resolved inconsistently`
            );
        }

        return Object.freeze({
            workspaceId: alias.workspaceId,
            modeId: alias.modeId,
            definitionId: assertDefinitionId(alias.modeId),
            source: 'legacy-alias',
        });
    }

    // 5. Legacy alias (mode)
    if (hasWorkspaceAlias(rawMode)) {
        const alias = getWorkspaceAlias(rawMode);

        if (getCanonicalMode(alias.modeId)?.workspaceId !== alias.workspaceId) {
            throw new Error(
                `[Dropple Constitution] Alias "${rawMode}" resolved inconsistently`
            );
        }

        return Object.freeze({
            workspaceId: alias.workspaceId,
            modeId: alias.modeId,
            definitionId: assertDefinitionId(alias.modeId),
            source: 'legacy-alias',
        });
    }

    // 6. Fallback (constitutional default)
    const fallbackWorkspaceId = 'design';
    const fallbackModeId = resolveWorkspaceDefaultMode(fallbackWorkspaceId);

    return Object.freeze({
        workspaceId: fallbackWorkspaceId,
        modeId: fallbackModeId,
        definitionId: assertDefinitionId(fallbackModeId),
        source: 'fallback',
    });
}

/* =========================
   PASS-THROUGH HELPERS
   ========================= */

export function resolveModeDefinition(modeId) {
    return hasModeDefinition(modeId)
        ? getModeDefinition(modeId)
        : null;
}

export function resolveWorkspaceDefinition(workspaceId) {
    return hasCanonicalWorkspace(workspaceId)
        ? getCanonicalWorkspace(workspaceId)
        : null;
}

export function listWorkspaceAliases() {
    return Object.keys(WORKSPACE_ALIASES).sort();
}

export function listCanonicalWorkspaces() {
    return Object.keys(CANONICAL_WORKSPACES).sort();
}

export function listCanonicalModes() {
    return Object.keys(CANONICAL_MODES).sort();
}
