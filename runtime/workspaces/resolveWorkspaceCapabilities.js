import {
    WORKSPACE_CAPABILITIES,
    WORKSPACE_MODE_CAPABILITIES,
    WORKSPACE_OVERLAY_CAPABILITIES,
} from './workspaceCapabilities.js';

export function resolveWorkspaceCapabilities({ workspace, mode, overlayId } = {}) {
    const baseCapabilities = WORKSPACE_CAPABILITIES[workspace] || [];
    const overlayCapabilities =
        mode != null ? WORKSPACE_MODE_CAPABILITIES[`${workspace}:${mode}`] || [] : [];
    const derivedOverlayCapabilities =
        overlayId != null ? WORKSPACE_OVERLAY_CAPABILITIES[`${workspace}:${overlayId}`] || [] : [];

    return Array.from(
        new Set([...baseCapabilities, ...overlayCapabilities, ...derivedOverlayCapabilities]),
    );
}
