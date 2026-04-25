import { WorkspaceRegistry } from '@/workspaces/registry/index.js';
import { resolveWorkspacePolicy } from '@/workspaces/registry/resolveWorkspacePolicy.js';
import { resolveWorkspaceContext } from './resolveWorkspaceContext.js';

export function listWorkspaceDefinitions() {
    return Object.entries(WorkspaceRegistry).sort(([left], [right]) => left.localeCompare(right));
}

export function hasWorkspaceDefinition(workspaceId) {
    return Boolean(WorkspaceRegistry[workspaceId]);
}

function resolveDefinitionId(input) {
    if (typeof input === 'string' && hasWorkspaceDefinition(input)) {
        return input;
    }

    return resolveWorkspaceContext(
        typeof input === 'string' ? { workspace: input } : input,
    )?.definitionId ?? 'uiux';
}

export function resolveWorkspaceId(input) {
    return resolveWorkspaceContext(
        typeof input === 'string' ? { workspace: input } : input,
    )?.workspaceId ?? 'design';
}

export function getWorkspaceDefinition(input) {
    const definitionId = resolveDefinitionId(input);
    const resolved = resolveWorkspacePolicy(definitionId);
    if (resolved && !resolved.error) {
        return resolved;
    }

    return WorkspaceRegistry[definitionId] ?? null;
}

export function getWorkspaceRegistry() {
    return WorkspaceRegistry;
}
