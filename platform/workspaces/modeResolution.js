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
import { resolveOverlayByLegacyMode } from './overlayRegistry.js';

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

function freezeModeResolution(result) {
    return Object.freeze(result);
}

function resolveAliasEntry(entryId) {
    if (!entryId) return null;

    if (hasWorkspaceAlias(entryId)) {
        return getWorkspaceAlias(entryId);
    }

    return null;
}

function resolveOverlayModeEntry(entryId) {
    const normalizedId = normalizeId(entryId);
    if (!normalizedId) return null;

    const overlay = resolveOverlayByLegacyMode(normalizedId);
    if (overlay) {
        return Object.freeze({
            originalModeId: normalizedId,
            canonicalModeId: overlay.ownerModeId,
            workspaceId: overlay.ownerWorkspaceId,
            overlayId: overlay.overlayId,
            overlayClass: overlay.class,
            source: 'overlay',
        });
    }

    const alias = resolveAliasEntry(normalizedId);
    if (!alias) return null;

    const aliasOverlay = resolveOverlayByLegacyMode(alias.modeId);
    if (!aliasOverlay) return null;

    return Object.freeze({
        originalModeId: normalizedId,
        canonicalModeId: aliasOverlay.ownerModeId,
        workspaceId: aliasOverlay.ownerWorkspaceId,
        overlayId: aliasOverlay.overlayId,
        overlayClass: aliasOverlay.class,
        source: 'overlay-alias',
    });
}

function resolveModeOwnershipMapping(modeId) {
    const canonicalMode = getCanonicalMode(modeId);
    if (canonicalMode) {
        return Object.freeze({
            workspaceId: canonicalMode.workspaceId,
            canonical: true,
            overlay: null,
        });
    }

    const overlay = resolveOverlayByLegacyMode(modeId);
    if (overlay) {
        return Object.freeze({
            workspaceId: overlay.ownerWorkspaceId,
            canonical: false,
            overlay,
        });
    }

    return null;
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
    'systems-engineering': Object.freeze({ workspaceId: 'build', modeId: 'systems-engineering' }),
    'enterprise-operations': Object.freeze({ workspaceId: 'build', modeId: 'enterprise-operations' }),

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

        const ownership = resolveModeOwnershipMapping(mapping.modeId);

        if (!ownership) {
            throw new Error(
                `[Dropple Constitution] Alias "${alias}" references unknown mode or overlay "${mapping.modeId}"`
            );
        }

        if (ownership.workspaceId !== mapping.workspaceId) {
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

export function resolveModeWithOverlay(modeId) {
    const normalizedId = normalizeId(modeId);

    if (!normalizedId) {
        return freezeModeResolution({
            originalModeId: null,
            canonicalModeId: null,
            workspaceId: null,
            overlayId: null,
            overlayClass: null,
            source: 'unknown',
        });
    }

    const overlayEntry = resolveOverlayModeEntry(normalizedId);
    if (overlayEntry) {
        return overlayEntry;
    }

    if (hasCanonicalMode(normalizedId)) {
        return freezeModeResolution({
            originalModeId: normalizedId,
            canonicalModeId: normalizedId,
            workspaceId: resolveModeOwner(normalizedId),
            overlayId: null,
            overlayClass: null,
            source: 'canonical-mode',
        });
    }

    const alias = resolveAliasEntry(normalizedId);
    if (alias) {
        return freezeModeResolution({
            originalModeId: normalizedId,
            canonicalModeId: alias.modeId,
            workspaceId: alias.workspaceId,
            overlayId: null,
            overlayClass: null,
            source: 'legacy-alias',
        });
    }

    return freezeModeResolution({
        originalModeId: normalizedId,
        canonicalModeId: null,
        workspaceId: null,
        overlayId: null,
        overlayClass: null,
        source: 'unknown',
    });
}

export function resolveCanonicalWorkspaceOverlayContext(input = {}) {
    const rawWorkspace = typeof input === 'string'
        ? normalizeId(input)
        : normalizeId(input.workspaceId ?? input.workspace);

    const rawMode = typeof input === 'object' && input
        ? normalizeId(input.modeId ?? input.mode)
        : null;

    const base = resolveCanonicalWorkspaceContext(input);
    const overlayResolution = resolveModeWithOverlay(rawMode ?? rawWorkspace);

    return freezeModeResolution({
        workspaceId: base.workspaceId,
        modeId: base.modeId,
        definitionId: base.definitionId,
        source: base.source,
        originalModeId: overlayResolution.originalModeId,
        canonicalModeId: overlayResolution.canonicalModeId,
        overlayId: overlayResolution.overlayId,
        overlayClass: overlayResolution.overlayClass,
    });
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

    // 3. Canonical workspace + legacy mode compatibility
    if (hasCanonicalWorkspace(rawWorkspace) && rawMode) {
        const explicitOwnership = resolveModeOwnershipMapping(rawMode);

        if (explicitOwnership && explicitOwnership.workspaceId === rawWorkspace) {
            return Object.freeze({
                workspaceId: rawWorkspace,
                modeId: rawMode,
                definitionId: assertDefinitionId(rawMode),
                source: explicitOwnership.canonical ? 'canonical' : 'legacy-mode-compat',
            });
        }
    }

    if (hasCanonicalWorkspace(rawWorkspace) && hasWorkspaceAlias(rawMode)) {
        const alias = getWorkspaceAlias(rawMode);
        const ownership = resolveModeOwnershipMapping(alias.modeId);

        if (!ownership || ownership.workspaceId !== rawWorkspace) {
            throw new Error(
                `[Dropple Constitution] Mode "${rawMode}" does not belong to workspace "${rawWorkspace}"`
            );
        }

        return Object.freeze({
            workspaceId: rawWorkspace,
            modeId: alias.modeId,
            definitionId: assertDefinitionId(alias.modeId),
            source: 'legacy-mode-compat',
        });
    }

    // 4. Canonical mode only
    if (!rawWorkspace && hasCanonicalMode(rawMode)) {
        const workspaceId = resolveModeOwner(rawMode);

        return Object.freeze({
            workspaceId,
            modeId: rawMode,
            definitionId: assertDefinitionId(rawMode),
            source: 'mode-direct',
        });
    }

    // 5. Canonical mode via direct workspace route segment
    if (hasCanonicalMode(rawWorkspace) && !rawMode) {
        const workspaceId = resolveModeOwner(rawWorkspace);

        return Object.freeze({
            workspaceId,
            modeId: rawWorkspace,
            definitionId: assertDefinitionId(rawWorkspace),
            source: 'mode-direct',
        });
    }

    // 6. Legacy alias (workspace)
    if (hasWorkspaceAlias(rawWorkspace)) {
        const alias = getWorkspaceAlias(rawWorkspace);
        const ownership = resolveModeOwnershipMapping(alias.modeId);

        if (!ownership || ownership.workspaceId !== alias.workspaceId) {
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

    // 7. Legacy alias (mode)
    if (hasWorkspaceAlias(rawMode)) {
        const alias = getWorkspaceAlias(rawMode);
        const ownership = resolveModeOwnershipMapping(alias.modeId);

        if (!ownership || ownership.workspaceId !== alias.workspaceId) {
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

    // 8. Fallback (constitutional default)
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
