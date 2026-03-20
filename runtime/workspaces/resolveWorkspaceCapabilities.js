import {
    WORKSPACE_CAPABILITIES,
    WORKSPACE_MODE_CAPABILITIES,
} from './workspaceCapabilities.js';

export function resolveWorkspaceCapabilities({ workspace, mode } = {}) {
    const baseCapabilities = WORKSPACE_CAPABILITIES[workspace] || [];
    const overlayCapabilities =
        mode != null ? WORKSPACE_MODE_CAPABILITIES[`${workspace}:${mode}`] || [] : [];

    return Array.from(new Set([...baseCapabilities, ...overlayCapabilities]));
}
