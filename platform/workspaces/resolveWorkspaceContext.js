import { resolveCanonicalWorkspaceContext, resolveModeDefinition } from './modeResolution.js';
import { getCanonicalWorkspace, getCanonicalMode } from './canonicalRegistry.js';

export function resolveWorkspaceContext(input = {}) {
    const resolved = resolveCanonicalWorkspaceContext(input);
    const rawWorkspaceId =
        typeof input === 'string' ? input : (input?.workspaceId ?? input?.workspace ?? null);
    const rawModeId =
        typeof input === 'object' && input ? (input?.modeId ?? input?.mode ?? null) : null;

    const workspace = getCanonicalWorkspace(resolved.workspaceId);
    const mode = getCanonicalMode(resolved.modeId);
    const modeDefinition = resolveModeDefinition(resolved.modeId);

    return Object.freeze({
        workspaceId: resolved.workspaceId,
        modeId: resolved.modeId,

        // compatibility fields for older callers
        workspace: resolved.workspaceId,
        mode: resolved.modeId,

        label: workspace?.label ?? resolved.workspaceId,
        modeLabel: mode?.label ?? modeDefinition?.label ?? resolved.modeId,
        definitionId: resolved.definitionId ?? null,

        isLegacy: resolved.source === 'legacy-alias',
        legacyId:
            resolved.source === 'legacy-alias'
                ? rawWorkspaceId
                : resolved.source === 'legacy-mode-compat'
                  ? rawModeId
                  : null,

        source: resolved.source,
    });
}
