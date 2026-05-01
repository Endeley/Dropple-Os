import { resolveModeWithOverlay, WORKSPACE_ALIASES } from './modeResolution.js';

function freezeLegacyEntry(entryId, workspaceId, modeId, definitionId) {
    const overlayResolution = resolveModeWithOverlay(entryId);

    return Object.freeze({
        workspace: workspaceId,
        mode: modeId,
        definitionId,
        originalModeId: entryId,
        canonicalModeId: overlayResolution.canonicalModeId ?? modeId,
        overlayId: overlayResolution.overlayId ?? null,
        overlayClass: overlayResolution.overlayClass ?? null,
    });
}

function createLegacyWorkspaceMap() {
    const entries = {};

    for (const [entryId, alias] of Object.entries(WORKSPACE_ALIASES)) {
        entries[entryId] = freezeLegacyEntry(
            entryId,
            alias.workspaceId,
            alias.modeId,
            alias.modeId,
        );
    }

    entries.dev = freezeLegacyEntry('dev', 'build', 'application', 'dev');
    entries.translate = freezeLegacyEntry('translate', 'build', 'conversion', 'translate');
    entries.ai = freezeLegacyEntry('ai', 'build', 'ai-build', 'ai');
    entries.material = freezeLegacyEntry('material', 'system', 'tokens', 'material');

    return Object.freeze(entries);
}

export const LEGACY_WORKSPACE_MAP = createLegacyWorkspaceMap();

export function hasLegacyWorkspaceEntry(entryId) {
    return Boolean(entryId && LEGACY_WORKSPACE_MAP[entryId]);
}

export function getLegacyWorkspaceEntry(entryId) {
    return hasLegacyWorkspaceEntry(entryId)
        ? LEGACY_WORKSPACE_MAP[entryId]
        : null;
}

export function listLegacyWorkspaceEntryIds() {
    return Object.keys(LEGACY_WORKSPACE_MAP).sort();
}
