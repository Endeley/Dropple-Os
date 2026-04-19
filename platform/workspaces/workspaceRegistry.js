import { WorkspaceRegistry } from '@/workspaces/registry/index.js';
import { resolveWorkspacePolicy } from '@/workspaces/registry/resolveWorkspacePolicy.js';

const MODE_ALIASES = Object.freeze({
    design: 'graphic',
});

export function listWorkspaceDefinitions() {
    return Object.entries(WorkspaceRegistry).sort(([left], [right]) => left.localeCompare(right));
}

export function hasWorkspaceDefinition(workspaceId) {
    return Boolean(WorkspaceRegistry[workspaceId]);
}

export function resolveWorkspaceId(modeId) {
    if (!modeId) return 'graphic';

    const key = String(modeId);

    if (hasWorkspaceDefinition(key)) return key;
    if (MODE_ALIASES[key] && hasWorkspaceDefinition(MODE_ALIASES[key])) {
        return MODE_ALIASES[key];
    }

    return 'graphic';
}

export function getWorkspaceDefinition(workspaceId) {
    const normalizedId = resolveWorkspaceId(workspaceId);
    const resolved = resolveWorkspacePolicy(normalizedId);
    if (resolved && !resolved.error) {
        return resolved;
    }

    return WorkspaceRegistry[normalizedId] ?? null;
}

export function getWorkspaceRegistry() {
    return WorkspaceRegistry;
}
