import { getCapability } from './capabilityRegistry.js';
import { getWorkspacePolicy } from './workspacePolicy.js';

export function resolveWorkspaceCapabilities(workspace) {
    const policy = getWorkspacePolicy(workspace);

    if (!policy) {
        throw new Error(`Workspace ${workspace} has no policy`);
    }

    return [...new Set(policy.capabilities || [])]
        .sort((a, b) => a.localeCompare(b))
        .map((capabilityId) => getCapability(capabilityId))
        .filter(Boolean);
}
