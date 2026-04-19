import { resolveCanonicalWorkspaceContext } from './modeResolution.js';
import { getCanonicalWorkspace, getCanonicalMode } from './canonicalRegistry.js';

export function resolveWorkspaceContext(input = {}) {
    const resolved = resolveCanonicalWorkspaceContext(input);

    const workspace = getCanonicalWorkspace(resolved.workspaceId);
    const mode = getCanonicalMode(resolved.modeId);

    return Object.freeze({
        workspaceId: resolved.workspaceId,
        modeId: resolved.modeId,

        // compatibility fields for older callers
        workspace: resolved.workspaceId,
        mode: resolved.modeId,

        label: workspace?.label ?? resolved.workspaceId,
        modeLabel: mode?.label ?? resolved.modeId,
        definitionId: resolved.definitionId ?? null,

        isLegacy: resolved.source === 'legacy-alias',
        legacyId: resolved.source === 'legacy-alias' ? (typeof input === 'string' ? input : (input?.workspaceId ?? input?.workspace ?? input?.modeId ?? input?.mode ?? null)) : null,

        source: resolved.source,
    });
}
