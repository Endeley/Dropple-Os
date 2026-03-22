import { CANONICAL_WORKSPACES } from './canonicalRegistry.js';
import { LEGACY_WORKSPACE_MAP } from './legacyMapping.js';

function getDefaultMode(workspaceId) {
    const workspace = CANONICAL_WORKSPACES[workspaceId];
    if (!workspace) return null;

    const modes = Object.values(workspace.modes ?? {});
    return modes[0] ?? null;
}

function resolveCanonicalDefinitionId(workspaceId, modeId) {
    if (workspaceId === 'design') return modeId;
    if (workspaceId === 'media') return modeId;
    if (workspaceId === 'build') {
        if (modeId === 'application' || modeId === 'logic' || modeId === 'state-machine' || modeId === 'api') {
            return 'dev';
        }
        if (modeId === 'conversion') return 'conversion';
        if (modeId === 'ai-build') return 'ai';
    }
    if (workspaceId === 'system') return 'material';
    if (workspaceId === 'collaborate') {
        if (modeId === 'review') return 'review';
        if (modeId === 'education') return 'education';
    }

    return null;
}

export function resolveWorkspaceContext({ workspace, mode } = {}) {
    const workspaceKey = String(workspace ?? '').toLowerCase();
    const modeKey = String(mode ?? '').toLowerCase();

    if (workspaceKey && CANONICAL_WORKSPACES[workspaceKey]) {
        const canonicalWorkspace = CANONICAL_WORKSPACES[workspaceKey];
        const resolvedMode =
            (modeKey && canonicalWorkspace.modes?.[modeKey]) || getDefaultMode(workspaceKey);
        const definitionId = resolveCanonicalDefinitionId(workspaceKey, resolvedMode?.id ?? null);

        return {
            workspace: canonicalWorkspace.id,
            mode: resolvedMode?.id ?? null,
            label: canonicalWorkspace.label,
            modeLabel: resolvedMode?.label ?? null,
            definitionId,
            isLegacy: false,
            legacyId: definitionId,
        };
    }

    if (workspaceKey && LEGACY_WORKSPACE_MAP[workspaceKey]) {
        const mapping = LEGACY_WORKSPACE_MAP[workspaceKey];

        return {
            workspace: mapping.workspace,
            mode: mapping.mode,
            label: CANONICAL_WORKSPACES[mapping.workspace]?.label ?? mapping.workspace,
            modeLabel:
                CANONICAL_WORKSPACES[mapping.workspace]?.modes?.[mapping.mode]?.label ?? mapping.mode,
            definitionId: mapping.definitionId,
            isLegacy: true,
            legacyId: workspaceKey,
        };
    }

    return {
        workspace: 'design',
        mode: 'uiux',
        label: CANONICAL_WORKSPACES.design.label,
        modeLabel: CANONICAL_WORKSPACES.design.modes.uiux.label,
        definitionId: 'uiux',
        isLegacy: false,
        legacyId: null,
    };
}
