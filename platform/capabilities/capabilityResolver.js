import { getCapability } from './capabilityRegistry.js';
import { getWorkspacePolicy } from './workspacePolicy.js';
import { ensureWorkspacePolicyRegistered } from './workspaceRegistryBridge.js';

export function resolveWorkspaceCapabilityIds(workspace) {
    const policy = getWorkspacePolicy(workspace) ?? ensureWorkspacePolicyRegistered(workspace);

    if (!policy) {
        throw new Error(`Workspace ${workspace} has no policy`);
    }

    return [...new Set(policy.capabilities || [])].sort((a, b) => a.localeCompare(b));
}

export function resolveWorkspaceCapabilities(workspace) {
    return resolveWorkspaceCapabilityIds(workspace)
        .map((capabilityId) => getCapability(capabilityId))
        .filter(Boolean);
}
