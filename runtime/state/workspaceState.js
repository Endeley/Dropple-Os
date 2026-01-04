let activeWorkspaceId = 'graphic'; // default

export function setActiveWorkspace(id) {
    activeWorkspaceId = id;
}

export function getActiveWorkspace() {
    return activeWorkspaceId;
}
