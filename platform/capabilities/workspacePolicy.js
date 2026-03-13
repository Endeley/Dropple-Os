const workspacePolicies = new Map();

export function registerWorkspacePolicy(policy) {
    if (!policy?.workspace) {
        throw new Error('Workspace policy must define workspace id');
    }

    workspacePolicies.set(policy.workspace, policy);
}

export function getWorkspacePolicy(workspace) {
    return workspacePolicies.get(workspace);
}

export function getAllWorkspacePolicies() {
    return Array.from(workspacePolicies.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, policy]) => policy);
}

export function clearWorkspacePolicies() {
    workspacePolicies.clear();
}
